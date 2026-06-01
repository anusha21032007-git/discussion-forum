import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, Trash2, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function HomeFeed({ user, sortBy, activeFilter, searchTerm }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [commentInputs, setCommentInputs] = useState({});
  const [deleteModal, setDeleteModal] = useState({ open: false, postId: null });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      console.log("[Like System] Fetching posts for user:", user?.id);

      let query = supabase.from("posts").select("*");

      // Time filters
      const now = new Date();
      if (activeFilter === "today") {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        query = query.gte("created_at", today.toISOString());
      } else if (activeFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        query = query.gte("created_at", weekAgo.toISOString());
      } else if (activeFilter === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        query = query.gte("created_at", monthAgo.toISOString());
      }

      // Sorting
      if (sortBy === "oldest") {
        query = query.order("created_at", { ascending: true });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data: fetchedPosts, error: postError } = await query;
      if (postError) {
        console.error("[Like System] Error fetching posts:", postError);
        setError(postError.message);
        setLoading(false);
        return;
      }

      // Fetch comments (real comments only)
      const postIds = fetchedPosts.map(p => p.id);
      if (postIds.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      const { data: fetchedComments, error: commentError } = await supabase
        .from("comments")
        .select("*")
        .in("post_id", postIds);

      if (commentError) {
        console.error("[Like System] Error fetching comments:", commentError);
        setError(commentError.message);
        setLoading(false);
        return;
      }

      // Fetch likes from the dedicated likes table
      const { data: fetchedLikes, error: likesError } = await supabase
        .from("likes")
        .select("*")
        .in("post_id", postIds);

      if (likesError) {
        console.error("[Like System] Error fetching likes:", likesError);
        setError(likesError.message);
        setLoading(false);
        return;
      }

      // Organize comments by post
      const commentsByPost = {};
      fetchedComments.forEach(comment => {
        if (!commentsByPost[comment.post_id]) {
          commentsByPost[comment.post_id] = [];
        }
        commentsByPost[comment.post_id].push(comment);
      });

      // Organize likes by post and determine which posts the current user liked
      const likesByPost = {};
      const userLikedSet = new Set();
      fetchedLikes.forEach(like => {
        if (!likesByPost[like.post_id]) {
          likesByPost[like.post_id] = [];
        }
        likesByPost[like.post_id].push(like);
        if (like.user_id === user?.id) {
          userLikedSet.add(like.post_id);
        }
      });

      const postsWithCommentsAndLikes = fetchedPosts.map(post => ({
        ...post,
        comments: (commentsByPost[post.id] || []).sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        ),
        likesCount: (likesByPost[post.id] || []).length,
      }));

      setLikedPosts(userLikedSet);
      setPosts(postsWithCommentsAndLikes);
      setLoading(false);
    };
    fetchData();
  }, [sortBy, activeFilter, user]);

  // Apply client-side search
  const filteredPosts = posts.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (p.title && p.title.toLowerCase().includes(term)) ||
      (p.content && p.content.toLowerCase().includes(term))
    );
  });

  const handleLikeToggle = async (postId) => {
    console.log("Current User:", user);
    console.log("User ID:", user?.id);
    console.log("Post ID:", postId);

    const isLiked = likedPosts.has(postId);
    console.log(`[Like System] Toggling like for Post ID: ${postId}. Currently liked: ${isLiked}`);

    // Optimistic UI update
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (isLiked) next.delete(postId);
      else next.add(postId);
      return next;
    });

    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const diff = isLiked ? -1 : 1;
          return { ...p, likesCount: Math.max(0, (p.likesCount || 0) + diff) };
        }
        return p;
      })
    );

    try {
      let responseError = null;

      if (isLiked) {
        // Unlike: delete from likes table
        console.log("[Like System] Deleting like payload:", {
          post_id: postId,
          user_id: user.id,
        });
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        responseError = error;
      } else {
        // Like: insert into likes table
        const payload = {
          post_id: postId,
          user_id: user.id,
        };
        console.log("[Like System] Inserting like payload:", payload);
        const { error } = await supabase.from("likes").insert(payload);
        responseError = error;
      }

      if (responseError) {
        console.error("Supabase error code:", responseError.code);
        console.error("Supabase error message:", responseError.message);
        console.error("Supabase error details:", responseError.details);

        // Revert optimistic UI update on failure
        setLikedPosts(prev => {
          const next = new Set(prev);
          if (isLiked) next.add(postId);
          else next.delete(postId);
          return next;
        });

        setPosts(prev =>
          prev.map(p => {
            if (p.id === postId) {
              const diff = isLiked ? 1 : -1;
              return { ...p, likesCount: Math.max(0, (p.likesCount || 0) + diff) };
            }
            return p;
          })
        );

        setToast("Failed to update like. Please check database permissions.");
        setTimeout(() => setToast(null), 4000);
      } else {
        console.error("[Like System] Supabase operation succeeded!");
      }
    } catch (err) {
      console.error("[Like System] Exception during like toggle:", err);
    }
  };

  const handleCommentSubmit = async (postId) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          user_id: user.id,
          user_email: user.user_metadata?.username || user.email.split("@")[0],
          content: text,
        })
        .select();

      if (error) throw error;

      setPosts(prev =>
        prev.map(p => {
          if (p.id === postId) {
            return { ...p, comments: [data[0], ...p.comments] };
          }
          return p;
        })
      );
      setCommentInputs(prev => ({ ...prev, [postId]: "" }));
    } catch (err) {
      alert("Failed to add comment: " + err.message);
    }
  };

  const handleShare = async (post) => {
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setToast("Link copied successfully");
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast("Failed to copy link");
      setTimeout(() => setToast(null), 3000);
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => {
      const s = new Set(prev);
      if (s.has(postId)) s.delete(postId);
      else s.add(postId);
      return s;
    });
  };

  // Delete functionality
  const handleDeleteClick = (postId) => {
    setDeleteModal({ open: true, postId });
  };

  const handleDeleteConfirm = async () => {
    const { postId } = deleteModal;
    if (!postId) return;

    try {
      // Delete comments and likes first
      await supabase.from("comments").delete().eq("post_id", postId);
      await supabase.from("likes").delete().eq("post_id", postId);
      
      // Delete the post
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;

      // Update UI
      setPosts(prev => prev.filter(p => p.id !== postId));
      setToast("Post deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      setToast("Failed to delete post");
    } finally {
      setDeleteModal({ open: false, postId: null });
      setTimeout(() => setToast(null), 3000);
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading...</div>;
  if (error) return <div className="text-center text-red-600 dark:text-red-400 py-8">Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {filteredPosts.map((post) => {
        const isCurrentUser = post.author_id === user?.id || post.user_id === user?.id;

        // Add debugging logs
        console.log("Current User ID:", user?.id);
        console.log("Post User ID:", post.user_id);
        console.log("Is Owner:", post.author_id === user?.id || post.user_id === user?.id);
        console.log("Delete Button Should Render:", isCurrentUser);

        // Parse the encoded author username from the content field
        let displayContent = post.content || "";
        let authorName = "Community Member";

        if (displayContent.includes("\n\n__AUTHOR__:")) {
          const parts = displayContent.split("\n\n__AUTHOR__:");
          displayContent = parts[0];
          authorName = parts[1];
        } else {
          authorName = isCurrentUser
            ? (user?.user_metadata?.username || "You")
            : "Community Member";
        }

        const avatarLetter = authorName.charAt(0).toUpperCase();

        return (
          <div
            key={post.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                  {avatarLetter}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{authorName}</p>
                    {isCurrentUser && (
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        Posted by you
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(post.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              
              {/* Delete Icon - Top Right */}
              {isCurrentUser && (
                <button
                  onClick={() => handleDeleteClick(post.id)}
                  className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  title="Delete post"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{post.title}</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 leading-relaxed">{displayContent}</p>

            {/* Interaction Buttons */}
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => handleLikeToggle(post.id)}
                className={`flex items-center gap-1.5 transition-all duration-200 transform active:scale-125 ${
                  likedPosts.has(post.id) ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                }`}
              >
                <Heart
                  size={18}
                  className={`transition-all duration-300 ${
                    likedPosts.has(post.id) ? "fill-red-500 dark:fill-red-400 scale-110" : "scale-100"
                  }`}
                />
                <span className="font-medium text-sm text-gray-700 dark:text-gray-300">{post.likesCount || 0}</span>
              </button>
              <button
                onClick={() => toggleComments(post.id)}
                className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <MessageCircle size={18} />
                <span className="font-medium text-sm text-gray-700 dark:text-gray-300">{post.comments.length}</span>
              </button>
              <button
                onClick={() => handleShare(post)}
                className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <Share2 size={18} />
              </button>
            </div>

            {/* Expanded Comments */}
            {expandedComments.has(post.id) && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="space-y-3 max-h-60 overflow-y-auto mb-3">
                  {post.comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-semibold text-xs">
                        {(c.user_email || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 inline-block">
                          <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                            {c.user_email}
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{c.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(c.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new comment */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-semibold text-xs">
                    {user?.user_metadata?.username?.charAt(0).toUpperCase() ||
                      user?.email?.charAt(0).toUpperCase() ||
                      "?"}
                  </div>
                  <input
                    type="text"
                    value={commentInputs[post.id] || ""}
                    onChange={(e) =>
                      setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))
                    }
                    placeholder="Add a comment..."
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={() => handleCommentSubmit(post.id)}
                    className="text-blue-600 dark:text-blue-400 font-medium px-3 py-1.5 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Post</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, postId: null })}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 text-white bg-red-600 dark:bg-red-700 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-gray-800 dark:bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}