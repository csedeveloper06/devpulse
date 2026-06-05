export const formatIssue = (row: any) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  type: row.type,
  status: row.status,

  reporter: {
    id: row.reporter_id,
    name: row.reporter_name,
    role: row.reporter_role,
  },

  created_at: row.created_at,
  updated_at: row.updated_at,
});
