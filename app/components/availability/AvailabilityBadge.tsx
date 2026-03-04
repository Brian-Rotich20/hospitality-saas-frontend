export default function AvailabilityBadge({ status }: { status: 'published' | 'paused' | 'draft' }) {
    return (
        <div>
            <h1>{status}</h1>
            <h2>Availability Badge</h2>
        </div>
    );
}