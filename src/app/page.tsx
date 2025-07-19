import { UserProfile } from '../components/UserProfile';
import { PostList } from '../components/PostList';

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Next.js Typed API Demo</h1>
          <p className="text-lg text-gray-600">
            Fully typed API routes with zero codegen using TypeScript
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">User Profile</h2>
            <div className="border rounded-lg p-6">
              <UserProfile userId="123" />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Post List</h2>
            <div className="border rounded-lg p-6">
              <PostList />
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold">Features</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 border rounded">
              <h4 className="font-medium">🎯 Full Type Safety</h4>
              <p className="text-gray-600">Request/response types inferred from API handlers</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-medium">🚀 Zero Codegen</h4>
              <p className="text-gray-600">Types extracted directly from your route files</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-medium">⚡ SWR Integration</h4>
              <p className="text-gray-600">Built-in data fetching with caching and mutations</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
