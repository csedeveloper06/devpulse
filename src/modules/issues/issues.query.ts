export const ISSUE_SELECT_WITH_REPORTER = `
SELECT
  i.id,
  i.title,
  i.description,
  i.type,
  i.status,
  i.created_at,
  i.updated_at,

  u.id AS reporter_id,
  u.name AS reporter_name,
  u.role AS reporter_role

FROM issues i
INNER JOIN users u
ON i.reporter_id = u.id
`;
