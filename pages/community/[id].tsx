import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAPI } from '@/hooks/useAPI';
import { useAuth } from '@/hooks/useAuth';

const CommunityPostPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const api = useAPI();
  const { user } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        const response = await api.get(`/api/community/posts/${id}`);
        setPost(response.data);
      } catch (err) {
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
      {user?.id === post.authorId && (
        <div>
          <button onClick={() => router.push(`/community/edit/${id}`)}>
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default CommunityPostPage;
