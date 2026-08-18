'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, arrayMove, rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AlertCircle, GripVertical, Loader2, Upload, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ACCEPT, MAX_MB, MAX_PHOTOS } from './constants';
import type { Photo } from './types';
import { uploadService } from '../../../lib/api/endpoints';

interface PhotoUploaderProps {
  value:    string[];
  onChange: (v: string[]) => void;
}

// ── Single sortable tile (unchanged) ─────────────────────────────────────────
function SortableTile({
  photo, index, onRemove,
}: { photo: Photo; index: number; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: photo.id, disabled: photo.uploading || !!photo.error });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 group touch-none"
    >
      {photo.uploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <Loader2 size={18} className="text-[#2D3B45] animate-spin" />
        </div>
      )}
      {photo.error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 z-10 p-2 gap-1">
          <AlertCircle size={14} className="text-red-400" />
          <p className="text-[9px] text-red-400 text-center leading-tight line-clamp-2">{photo.error}</p>
        </div>
      )}
      {photo.url && !photo.uploading && !photo.error && (
        <img src={photo.url} alt={`Listing photo ${index + 1}`} className="w-full h-full object-cover" />
      )}

      {index === 0 && photo.url && !photo.error && (
        <span className="absolute top-1 left-1 text-[9px] font-black bg-[#F5C842]
          text-[#2D3B45] px-1.5 py-0.5 rounded z-20">
          COVER
        </span>
      )}

      {photo.url && !photo.uploading && !photo.error && (
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="absolute bottom-1 left-1 w-5 h-5 bg-black/60 text-white rounded-full
            flex items-center justify-center opacity-0 group-hover:opacity-100
            transition-opacity z-20 cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical size={11} />
        </button>
      )}

      <button
        type="button"
        onClick={() => onRemove(photo.id)}
        className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full
          flex items-center justify-center opacity-0 group-hover:opacity-100
          transition-opacity z-20 hover:bg-red-500"
        aria-label="Remove photo"
      >
        <X size={10} />
      </button>
    </div>
  );
}

export function PhotoUploader({ value, onChange }: PhotoUploaderProps) {
  const [photos, setPhotos] = useState<Photo[]>(
    value.map(url => ({ id: url, url, uploading: false })),
  );
  const [dragging, setDragging] = useState(false);
  const inputRef    = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  const uploadedCount = photos.filter(p => p.url && !p.error).length;
  const remaining     = MAX_PHOTOS - photos.filter(p => !p.error).length;

  useEffect(() => {
    const urls = photos
      .filter(p => p.url && p.url.trim().length > 0 && !p.uploading && !p.error)
      .map(p => p.url);
    onChangeRef.current(urls);
  }, [photos]);

  const uploadFile = useCallback(async (file: File, id: string) => {
    try {
      const res = await uploadService.uploadImage(file, 'listing_photo');
      const data = (res as any).data;
      const url: string = data?.url;
      if (!url) throw new Error('No URL returned from server');

      setPhotos(prev => prev.map(p => (p.id === id ? { ...p, url, uploading: false } : p)));
    } catch (err) {
      setPhotos(prev => prev.map(p => (p.id === id
        ? { ...p, uploading: false, error: err instanceof Error ? err.message : 'Upload failed' }
        : p)));
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    }
  }, []);

  const processFiles = useCallback((files: File[]) => {
    const valid = files.filter(f => ACCEPT.includes(f.type) && f.size <= MAX_MB * 1024 * 1024);
    if (!valid.length) {
      toast.error(`Only JPG/PNG/WebP up to ${MAX_MB}MB accepted`);
      return;
    }
    const slots = Math.min(valid.length, remaining);
    if (!slots) {
      toast.error(`Maximum ${MAX_PHOTOS} photos allowed`);
      return;
    }
    const next: Photo[] = valid.slice(0, slots).map(f => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      url: '',
      uploading: true,
    }));
    setPhotos(prev => [...prev, ...next]);
    next.forEach((p, i) => uploadFile(valid[i], p.id));
  }, [remaining, uploadFile]);

  const removePhoto = useCallback((id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  }, []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setPhotos(prev => {
      const oldIndex = prev.findIndex(p => p.id === active.id);
      const newIndex = prev.findIndex(p => p.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-gray-500">
          {uploadedCount} of {MAX_PHOTOS} photos
          {uploadedCount > 0 && ' · drag to reorder · first photo is your cover'}
        </span>
        <span className={`font-bold ${uploadedCount >= 3 ? 'text-emerald-600' : 'text-amber-600'}`}>
          {uploadedCount < 3 ? `${3 - uploadedCount} more needed to publish` : '✓ Ready to publish'}
        </span>
      </div>

      {remaining > 0 && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); processFiles(Array.from(e.dataTransfer.files)); }}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer
            transition-colors select-none
            ${dragging ? 'border-[#2D3B45] bg-[#2D3B45]/5' : 'border-gray-200 hover:border-[#2D3B45] hover:bg-gray-50'}`}
        >
          <input
            ref={inputRef} type="file" multiple accept={ACCEPT.join(',')}
            className="sr-only"
            onChange={e => { processFiles(Array.from(e.target.files ?? [])); e.target.value = ''; }}
          />
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 transition-colors
            ${dragging ? 'bg-[#2D3B45] text-white' : 'bg-gray-100 text-gray-400'}`}>
            <Upload size={18} />
          </div>
          <p className="text-sm font-bold text-gray-700">{dragging ? 'Drop here' : 'Drag photos or click to upload'}</p>
          <p className="text-[11px] text-gray-400 mt-1">JPG · PNG · WebP · max {MAX_MB}MB each</p>
        </div>
      )}

      {photos.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={photos.map(p => p.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((p, i) => (
                <SortableTile key={p.id} photo={p} index={i} onRemove={removePhoto} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}