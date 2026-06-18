import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  LoadingSpinner,
  PageHeader,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@solvera/pace-core/components';
import { PagePermissionGuard, useResourcePermissions } from '@solvera/pace-core/rbac';
import { TRAC_PAGE_NAMES } from '@/app/navigation/trac-page-names';
import { useTracEventBreadcrumbs } from '@/app/shell/use-trac-event-breadcrumbs';
import type { JournalPost, JournalPostStatus } from '@/types/journal';
import { JournalPostEditor } from '@/components/journal/JournalPostEditor';
import { JournalPostList } from '@/components/journal/JournalPostList';
import { useJournalPosts } from '@/hooks/journal/useJournalPosts';

type JournalStatusFilter = 'all' | JournalPostStatus;

function JournalPageContent() {
  const breadcrumbItems = useTracEventBreadcrumbs('Journal');
  const { canCreate, canUpdate, canDelete, isLoading: permissionsLoading } =
    useResourcePermissions(TRAC_PAGE_NAMES.journal);
  const {
    posts,
    isLoading,
    error,
    createPost,
    updatePost,
    deletePost,
    deleteImage,
    isMutating,
    isDeletingPost,
    isDeletingImage,
    uploadProgress,
  } = useJournalPosts();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<JournalPost | null>(null);
  const [statusFilter, setStatusFilter] = useState<JournalStatusFilter>('all');

  const handleNewEntry = useCallback(() => {
    setEditingPost(null);
    setEditorOpen(true);
  }, []);

  const handleEdit = useCallback((post: JournalPost) => {
    setEditingPost(post);
    setEditorOpen(true);
  }, []);

  const handleSave = useCallback(
    async (values: {
      title: string;
      content: string;
      status: JournalPostStatus;
      images: File[];
    }) => {
      if (editingPost != null) {
        await updatePost({
          postId: editingPost.id,
          title: values.title,
          content: values.content,
          status: values.status,
          images: values.images,
        });
      } else {
        await createPost(values);
      }
    },
    [createPost, updatePost, editingPost]
  );

  const handleDeletePost = useCallback(async () => {
    if (editingPost == null) return;
    await deletePost(editingPost);
    setEditorOpen(false);
    setEditingPost(null);
  }, [deletePost, editingPost]);

  const handleDeletePostFromCard = useCallback(
    async (post: JournalPost) => {
      await deletePost(post);
    },
    [deletePost]
  );

  const handlePublishFromCard = useCallback(
    async (post: JournalPost) => {
      await updatePost({
        postId: post.id,
        title: post.title,
        content: post.content,
        status: 'published',
        images: [],
      });
    },
    [updatePost]
  );

  const statusCounts = useMemo(() => {
    let drafts = 0;
    let published = 0;
    for (const post of posts) {
      if (post.status === 'draft') drafts += 1;
      if (post.status === 'published') published += 1;
    }
    return { all: posts.length, drafts, published };
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (statusFilter === 'all') return posts;
    return posts.filter((post) => post.status === statusFilter);
  }, [posts, statusFilter]);

  const headerActions = canCreate ? (
    <Button type="button" onClick={handleNewEntry}>
      New post
    </Button>
  ) : null;

  if (isLoading || permissionsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <section className="grid gap-4">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Journal"
        subtitle="Chronological record of this event with optional images."
        actions={headerActions}
      />

      {error != null && (
        <Alert variant="destructive">
          <AlertTitle>Could not load journal</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs
        value={statusFilter}
        onValueChange={(value) => {
          if (value === 'all' || value === 'draft' || value === 'published') {
            setStatusFilter(value);
          }
        }}
      >
        <TabsList>
          <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
          <TabsTrigger value="published">Published ({statusCounts.published})</TabsTrigger>
          <TabsTrigger value="draft">Drafts ({statusCounts.drafts})</TabsTrigger>
        </TabsList>
        <TabsContent value={statusFilter}>
          <JournalPostList
            posts={filteredPosts}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onEdit={handleEdit}
            onDeletePost={(post) => void handleDeletePostFromCard(post)}
            onPublish={(post) => void handlePublishFromCard(post)}
            onDeleteImage={(imageId) => void deleteImage(imageId)}
            isDeletingPost={isDeletingPost}
            isDeletingImage={isDeletingImage}
          />
        </TabsContent>
      </Tabs>

      <JournalPostEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        post={editingPost}
        onSave={handleSave}
        onDelete={editingPost != null ? handleDeletePost : undefined}
        canDelete={canDelete}
        isSubmitting={isMutating}
        uploadProgress={uploadProgress}
      />
    </section>
  );
}

export function JournalPage() {
  return (
    <main>
      <PagePermissionGuard pageName={TRAC_PAGE_NAMES.journal} operation="read">
        <JournalPageContent />
      </PagePermissionGuard>
    </main>
  );
}
