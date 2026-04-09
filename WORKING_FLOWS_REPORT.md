# Working Flows Report

## Working User Flows

### Trees

- list trees on dashboard
- create tree on dashboard
- open a concrete tree page from the tree list

### Persons

- load persons for a tree on the tree page
- create person on the tree page
- open person details page
- edit person on the person page
- delete person on the person page with a minimal confirmation step

### Relationships

- create relationship on the relationships page
- delete relationship by manual relationship ID on the relationships page

### Kinship

- run graph path request between two persons
- run kinship request between two persons
- show simple result / loading / error / empty states

## Pages Changed

- `src/pages/DashboardPage.tsx`
- `src/pages/TreePage.tsx`
- `src/pages/PersonPage.tsx`
- `src/pages/RelationshipsPage.tsx`

Supporting hook changes:

- `src/entities/person/model/use-person-queries.ts`
- `src/entities/relationship/model/use-relationship-mutations.ts`

## What Is Still Only Partially Connected

- tree update/delete/access-management endpoints exist in API layer, but there is still no dedicated UI for them
- relationship delete is connected only as a minimal manual action by relationship ID
- there is still no relationship listing UI because the current backend schema does not expose a list endpoint for relationships in the frontend flow

## Intentional UX Limitations

- no redesign was introduced
- no modals were added
- delete actions use minimal utility UX
- relationship deletion is intentionally plain and ID-driven
- person editing is done inline on the person details page without creating a separate edit route

## Validation

Commands run:

```bash
npx tsc --noEmit
npm run build
```

Result:

- typecheck passed
- build passed
