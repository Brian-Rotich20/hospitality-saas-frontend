'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Plus, Pencil, Trash2, ChevronRight, ChevronDown,
  Loader2, X, Check, FolderOpen, Folder, Tag,
  Building2, Utensils, Camera, Music, Flower2,
  Bus, MoreHorizontal, BookOpen, Sparkles, LayoutGrid, Upload,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '../../lib/api/client';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Category {
  id:        string;
  name:      string;
  slug:      string;
  icon?:     string;
  parentId?: string;
  imageUrl?: string;
  children?: Category[];
}

// ── Icon registry — maps icon name string (stored in DB) to component ─────────
const ICON_OPTIONS = [
  { name: 'Building2',      Icon: Building2,      label: 'Venue'         },
  { name: 'Utensils',       Icon: Utensils,       label: 'Food'          },
  { name: 'Camera',         Icon: Camera,         label: 'Photography'   },
  { name: 'Music',          Icon: Music,          label: 'Music'         },
  { name: 'Flower2',        Icon: Flower2,        label: 'Decor'         },
  { name: 'Bus',            Icon: Bus,            label: 'Transport'     },
  { name: 'MoreHorizontal', Icon: MoreHorizontal, label: 'Entertainment' },
  { name: 'BookOpen',       Icon: BookOpen,       label: 'Education'     },
  { name: 'LayoutGrid',     Icon: LayoutGrid,     label: 'General'       },
  { name: 'Sparkles',       Icon: Sparkles,       label: 'Other'         },
  { name: 'Tag',            Icon: Tag,            label: 'Tag'           },
];

const ICON_MAP: Record<string, React.ElementType> = Object.fromEntries(
  ICON_OPTIONS.map(({ name, Icon }) => [name, Icon])
);

function CategoryIcon({ name, size = 16 }: { name?: string; size?: number }) {
  const Icon = (name && ICON_MAP[name]) ? ICON_MAP[name] : Sparkles;
  return <Icon size={size} />;
}

// ── Modal ─────────────────────────────────────────────────────────────────────
interface ModalProps {
  mode:       'create' | 'edit';
  initial?:   Partial<Category>;
  parentId?:  string;
  parentName?: string;
  allCategories: Category[];
  imageUrl: string;
  onClose:    () => void;
  onSave:     (data: { name: string; slug?: string; icon?: string; parentId?: string; imageUrl?: string; }) => Promise<void>;
}

function CategoryModal({ mode, initial, parentId, parentName, allCategories, onClose, onSave }: ModalProps) {
  const [name,        setName]        = useState(initial?.name     ?? '');
  const [slug,        setSlug]        = useState(initial?.slug     ?? '');
  const [icon,        setIcon]        = useState(initial?.icon     ?? 'Sparkles');
  const [imageUrl,    setImageUrl]    = useState(initial?.imageUrl ?? '');
  const [selParent,   setParent]      = useState(initial?.parentId ?? parentId ?? '');
  const [saving,      setSaving]      = useState(false);
  const [uploading,   setUploading]   = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleName = (v: string) => {
    setName(v);
    if (!slugTouched) {
      setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  };

  // ✅ Upload image via existing /api/upload/image endpoint
  const handleImageUpload = async (file: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG, WebP allowed'); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Max 5MB'); return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await apiClient.uploadFile<{ url: string }>(
        '/upload/image', file
      );
      const url = (res as any).data?.url ?? (res as any).url;
      if (!url) throw new Error('No URL returned');
      setImageUrl(url);
      toast.success('Image uploaded');
    } catch (err: any) {
      toast.error(err?.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      await onSave({
        name:     name.trim(),
        slug:     slug.trim() || undefined,
        icon:     icon        || undefined,
        imageUrl: imageUrl    || undefined,   
        parentId: selParent   || undefined,
      });
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const topLevel = allCategories.filter(c => !c.parentId && c.id !== initial?.id);

return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-sm font-black text-gray-900">
            {mode === 'create' ? 'New Category' : 'Edit Category'}
          </h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center
            rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
            <X size={14} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              Category Name <span className="text-red-400">*</span>
            </label>
            <input
              value={name}
              onChange={e => handleName(e.target.value)}
              placeholder="e.g. Photography"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl
                outline-none focus:ring-2 focus:ring-[#2D3B45] transition"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              Slug <span className="text-gray-400 font-normal">(auto-generated)</span>
            </label>
            <input
              value={slug}
              onChange={e => { setSlug(e.target.value); setSlugTouched(true); }}
              placeholder="photography"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl
                bg-gray-50 font-mono outline-none focus:ring-2 focus:ring-[#2D3B45] transition"
            />
          </div>

          {/* ✅ Image upload */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              Category Image
              <span className="text-gray-400 font-normal ml-1">
                (shown on mobile home grid)
              </span>
            </label>

            {/* Preview + upload zone */}
            <div
              onClick={() => !uploading && fileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl overflow-hidden
                cursor-pointer transition-colors
                ${uploading
                  ? 'border-gray-200 bg-gray-50 cursor-wait'
                  : imageUrl
                    ? 'border-[#2D3B45]/30 hover:border-[#2D3B45]'
                    : 'border-gray-200 hover:border-[#2D3B45] hover:bg-gray-50'}`}>

              {imageUrl ? (
                /* Image preview */
                <div className="relative h-32">
                  <img
                    src={imageUrl}
                    alt="Category"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20
                    transition flex items-center justify-center">
                    <span className="opacity-0 hover:opacity-100 text-white text-xs
                      font-bold bg-black/50 px-3 py-1.5 rounded-lg transition">
                      Change image
                    </span>
                  </div>
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setImageUrl(''); }}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white
                      rounded-full flex items-center justify-center hover:bg-red-600 transition">
                    <X size={11} />
                  </button>
                </div>
              ) : uploading ? (
                /* Upload progress */
                <div className="h-32 flex flex-col items-center justify-center gap-2">
                  <Loader2 size={20} className="text-[#2D3B45] animate-spin" />
                  <span className="text-xs text-gray-500 font-semibold">Uploading...</span>
                </div>
              ) : (
                /* Empty state */
                <div className="h-32 flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center
                    justify-center text-gray-400">
                    <Upload size={18} />
                  </div>
                  <p className="text-xs text-gray-500 font-semibold">
                    Click to upload image
                  </p>
                  <p className="text-[11px] text-gray-400">
                    JPEG · PNG · WebP · Max 5MB
                  </p>
                </div>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
                e.target.value = '';
              }}
            />

            {/* Icon fallback note */}
            {!imageUrl && (
              <p className="text-[11px] text-amber-600 mt-1.5">
                No image — icon will show as fallback in the store strip
              </p>
            )}
          </div>

          {/* Icon picker — fallback when no image */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              Fallback Icon
              <span className="text-gray-400 font-normal ml-1">
                (used on desktop strip if no image)
              </span>
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {ICON_OPTIONS.map(({ name: iconName, Icon, label }) => (
                <button key={iconName} type="button" title={label}
                  onClick={() => setIcon(iconName)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition
                    ${icon === iconName
                      ? 'border-[#2D3B45] bg-[#2D3B45]/5 text-[#2D3B45]'
                      : 'border-gray-100 text-gray-400 hover:border-gray-300'}`}>
                  <Icon size={16} />
                  <span className="text-[9px] leading-none">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Parent */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              Parent Category
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <select
              value={selParent}
              onChange={e => setParent(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl
                outline-none focus:ring-2 focus:ring-[#2D3B45] transition cursor-pointer">
              <option value="">None — top-level category</option>
              {topLevel.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 pb-5 sticky bottom-0 bg-white pt-2 border-t border-gray-100">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold
              text-gray-600 hover:border-gray-400 transition">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !name.trim() || uploading}
            className="flex-1 py-2.5 bg-[#2D3B45] text-white rounded-xl text-xs font-bold
              hover:bg-[#3a4d5a] transition disabled:opacity-50
              flex items-center justify-center gap-1.5">
            {saving
              ? <><Loader2 size={12} className="animate-spin" /> Saving...</>
              : <><Check size={12} /> {mode === 'create' ? 'Create' : 'Save'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Category row ──────────────────────────────────────────────────────────────
interface RowProps {
  category:      Category;
  depth:         number;
  allCategories: Category[];
  onEdit:        (c: Category) => void;
  onDelete:      (c: Category) => void;
  onAddChild:    (parent: Category) => void;
}

function CategoryRow({ category, depth, allCategories, onEdit, onDelete, onAddChild }: RowProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <>
      <div
        className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition group
          ${depth > 0 ? 'bg-gray-50/50' : ''}`}
        style={{ paddingLeft: `${16 + depth * 28}px` }}>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(v => !v)}
          className={`w-5 h-5 flex items-center justify-center rounded text-gray-400
            transition ${hasChildren ? 'hover:text-gray-600' : 'invisible'}`}>
          {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </button>

        {/* Icon */}
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0
          ${depth === 0
            ? 'bg-[#2D3B45]/10 text-[#2D3B45]'
            : 'bg-gray-100 text-gray-500'}`}>
          <CategoryIcon name={category.icon} size={14} />
        </div>

        {/* Name + slug */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">{category.name}</span>
            {depth === 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#2D3B45]/10
                text-[#2D3B45] rounded-md">
                Top-level
              </span>
            )}
            {hasChildren && (
              <span className="text-[10px] text-gray-400">
                {category.children!.length} sub
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 font-mono">{category.slug}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
          {depth === 0 && (
            <button
              onClick={() => onAddChild(category)}
              title="Add subcategory"
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200
                text-gray-400 hover:text-[#2D3B45] hover:border-[#2D3B45] transition text-[10px] font-bold">
              +sub
            </button>
          )}
          <button
            onClick={() => onEdit(category)}
            title="Edit"
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200
              text-gray-400 hover:text-[#2D3B45] hover:border-[#2D3B45] transition">
            <Pencil size={12} />
          </button>
          <button
            onClick={() => onDelete(category)}
            title="Delete"
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-red-100
              bg-red-50 text-red-400 hover:bg-red-100 transition">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && category.children!.map(child => (
        <CategoryRow
          key={child.id}
          category={child}
          depth={depth + 1}
          allCategories={allCategories}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      ))}
    </>
  );
}

// ── Delete confirm modal ──────────────────────────────────────────────────────
function DeleteModal({
  category,
  onConfirm,
  onClose,
  deleting,
}: {
  category: Category;
  onConfirm: () => void;
  onClose: () => void;
  deleting: boolean;
}) {
  const hasChildren = category.children && category.children.length > 0;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <h3 className="text-sm font-black text-gray-900 mb-1">Delete "{category.name}"?</h3>
        {hasChildren ? (
          <p className="text-xs text-red-600 mb-5">
            This category has {category.children!.length} subcategories.
            Delete or reassign them first.
          </p>
        ) : (
          <p className="text-xs text-gray-500 mb-5">
            This will remove the category permanently. Existing listings using
            this category will need to be reassigned.
          </p>
        )}
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold
              text-gray-600 hover:border-gray-400 transition">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting || hasChildren}
            className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-xs font-bold
              hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-1.5">
            {deleting
              ? <><Loader2 size={12} className="animate-spin" /> Deleting...</>
              : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main manager ──────────────────────────────────────────────────────────────
export function CategoryManagerClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [modal,      setModal]      = useState<{
    type:       'create' | 'edit';
    category?:  Category;
    parentId?:  string;
    parentName?: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting,     setDeleting]     = useState(false);

  // ── Flatten for parent selector ───────────────────────────────────────────
  const flatCategories = useCallback((): Category[] => {
    const flat: Category[] = [];
    const walk = (cats: Category[]) => cats.forEach(c => {
      flat.push(c);
      if (c.children) walk(c.children);
    });
    walk(categories);
    return flat;
  }, [categories]);

  // ── Refetch tree ──────────────────────────────────────────────────────────
  const refetch = useCallback(async () => {
    try {
      const res  = await apiClient.get<Category[]>('/categories/tree');
      const data = (res as any).data ?? res;
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to reload categories');
    }
  }, []);

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreate = async (data: {
    name: string; slug?: string; icon?: string; parentId?: string;
  }) => {
    await apiClient.post('/categories', data);
    toast.success('Category created');
    await refetch();
  };

  // ── Update ────────────────────────────────────────────────────────────────
  const handleUpdate = async (id: string, data: {
    name: string; slug?: string; icon?: string; parentId?: string;
  }) => {
    await apiClient.put(`/categories/${id}`, data);
    toast.success('Category updated');
    await refetch();
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/categories/${deleteTarget.id}`);
      toast.success('Category deleted');
      setDeleteTarget(null);
      await refetch();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const totalCount = flatCategories().length;
  const topCount   = categories.length;

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">
            Categories
          </h1>
          <p className="text-sm text-gray-500">
            {topCount} top-level · {totalCount} total ·{' '}
            <span className="text-[#2D3B45] font-semibold">
              Appear in store navigation strip
            </span>
          </p>
        </div>
        <button
          onClick={() => setModal({ type: 'create' })}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#2D3B45] text-white text-xs
            font-bold rounded-xl hover:bg-[#3a4d5a] transition shrink-0">
          <Plus size={14} /> New Category
        </button>
      </div>

      {/* Table */}
      {categories.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
          <FolderOpen size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-700 mb-1">No categories yet</p>
          <p className="text-xs text-gray-400 mb-5">
            Create your first category to organise listings and products
          </p>
          <button
            onClick={() => setModal({ type: 'create' })}
            className="px-4 py-2 bg-[#2D3B45] text-white text-xs font-bold rounded-xl
              hover:bg-[#3a4d5a] transition">
            Create First Category
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {/* Column headers */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
            <div className="w-5" />
            <div className="w-7" />
            <span className="flex-1 text-[10px] font-black text-gray-400 uppercase tracking-wide">
              Name / Slug
            </span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide w-24 text-right">
              Actions
            </span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-50">
            {categories.map(cat => (
              <CategoryRow
                key={cat.id}
                category={cat}
                depth={0}
                allCategories={flatCategories()}
                onEdit={c => setModal({ type: 'edit', category: c })}
                onDelete={c => setDeleteTarget(c)}
                onAddChild={parent => setModal({
                  type: 'create',
                  parentId: parent.id,
                  parentName: parent.name,
                })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Create / Edit modal */}
      {modal && (
        <CategoryModal
          mode={modal.type}
          initial={modal.category}
          parentId={modal.parentId}
          parentName={modal.parentName}
          allCategories={flatCategories()}
          onClose={() => setModal(null)}
          onSave={modal.type === 'create'
            ? handleCreate
            : (data) => handleUpdate(modal.category!.id, data)}
        />
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteModal
          category={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}
    </div>
  );
}