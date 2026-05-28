import { useState, useEffect } from 'react';
import { getTags, createTag } from '@/services/tagService';
import useRequireAuth from '@/hooks/useRequireAuth';

export const useTag = () => {
    const { ensureAuth } = useRequireAuth();

    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                setLoading(true);
                setError(null);

                const fetchedTags = await getTags();
                setTags(fetchedTags);
            } catch (err) {
                console.error(err);
                setError('Không thể tải danh sách tag');
            } finally {
                setLoading(false);
            }
        };

        fetchTags();
    }, []);

    const handleCreateTag = async (tagData) => {
        try {
            ensureAuth();
            setLoading(true);
            setError(null);

            const createdTag = await createTag(tagData);
            setTags([...tags, createdTag]);
        } catch (err) {
            console.error(err);
            setError('Không thể tạo tag');
        } finally {
            setLoading(false);
        }
    };

    return { tags, loading, error, handleCreateTag };
};
