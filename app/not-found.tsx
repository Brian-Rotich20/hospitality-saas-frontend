// Not found page for Linkmart
import Link from "next/link";


export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-6xl font-bold text-gray-800">404</h1>
            <p className="text-xl text-gray-600">Page Not Found</p>
            <Link href="/" className="mt-4 text-blue-500 hover:underline">
                Go back home
            </Link>
        </div>
    );
}