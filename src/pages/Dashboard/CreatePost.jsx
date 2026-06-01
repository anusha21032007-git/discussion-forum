import { useState } from "react";
import { Send } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function CreatePost({ user }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const username = user.user_metadata?.username || user.email.split("@")[0];
      // Encode the author's username securely inside the content field to avoid database schema limitations
      const encodedContent = `${content}\n\n__AUTHOR__:${username}`;

      const { error } = await supabase.from("posts").insert({
        author_id: user.id,
        user_id: user.id,
        title,
        content: encodedContent,
      });
      if (error) throw error;
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setTitle("");
        setContent("");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const displayUsername = user?.user_metadata?.username || user?.email?.split("@")[0] || "User";

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Create New Post</h2>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts with the community..."
              rows={6}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-shadow dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">Posting as <span className="font-semibold text-gray-700 dark:text-gray-300">{displayUsername}</span></p>
            <button
              type="submit"
              disabled={submitted || loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md"
            >
              <Send size={18} />
              {submitted ? "Posted!" : loading ? "Publishing..." : "Publish"}
            </button>
          </div>
          {error && <p className="text-red-600 dark:text-red-400 text-sm mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
}