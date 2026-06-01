import { useEffect, useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function Activity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUser(user);

        // 1. Fetch all posts created by the current user
        const { data: userPosts, error: postsError } = await supabase
          .from("posts")
          .select("id, title")
          .eq("author_id", user.id);

        if (postsError) throw postsError;

        if (!userPosts || userPosts.length === 0) {
          setActivities([]);
          setLoading(false);
          return;
        }

        const postIds = userPosts.map(p => p.id);
        const postsMap = userPosts.reduce((acc, p) => {
          acc[p.id] = p.title;
          return acc;
        }, {});

        // 2. Fetch all comments and likes on those posts (excluding current user's own actions)
        const { data: fetchedComments, error: commentsError } = await supabase
          .from("comments")
          .select("*")
          .in("post_id", postIds)
          .neq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (commentsError) throw commentsError;

        // 3. Map comments/likes to activity items
        const mappedActivities = fetchedComments.map(item => {
          const isLike = item.content === "__LIKE__";
          const userName = item.user_email || "Someone";
          const postTitle = postsMap[item.post_id] || "your post";

          return {
            id: item.id,
            type: isLike ? "like" : "comment",
            text: isLike 
              ? `${userName} liked your post "${postTitle}"`
              : `${userName} commented on your post "${postTitle}": "${item.content}"`,
            time: new Date(item.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            icon: isLike ? Heart : MessageCircle,
            color: isLike ? "text-red-500 dark:text-red-400" : "text-blue-500 dark:text-blue-400",
            bg: isLike ? "bg-red-50 dark:bg-red-900" : "bg-blue-50 dark:bg-blue-900",
          };
        });

        setActivities(mappedActivities);
      } catch (err) {
        console.error("Error fetching activities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading activities...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Activity</h2>
      {activities.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-500 dark:text-gray-400 shadow-sm">
          No new activities yet. When people like or comment on your posts, they will show up here!
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm divide-y divide-gray-100 dark:divide-gray-700">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-full ${activity.bg} flex items-center justify-center flex-shrink-0`}
              >
                <activity.icon size={20} className={activity.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{activity.text}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}