# Entity API Sync Report

## Old Contracts Found

### Trees

- frontend tree API only covered:
  - `GET /trees/`
  - `POST /trees/`
- no support for new schema endpoints:
  - `PATCH /trees/{tree_id}`
  - `DELETE /trees/{tree_id}`
  - `GET /trees/{tree_id}/access`
  - `POST /trees/{tree_id}/access`
  - `PATCH /trees/{tree_id}/access/{target_user_id}`
  - `DELETE /trees/{tree_id}/access/{target_user_id}`

### Persons

- frontend person API only covered:
  - `POST /persons/`
  - `GET /persons/tree/{tree_id}`
  - `GET /persons/{person_id}`
- no support for:
  - `PATCH /persons/{person_id}`
  - `DELETE /persons/{person_id}`

### Relationships

- frontend relationship API only covered:
  - `POST /relationships/`
- no support for:
  - `DELETE /relationships/{relationship_id}`

### Kinship

- kinship API was already aligned with current schema:
  - `GET /graph/path`
  - `GET /kinship/`

### DTO / enum observations

- `TreeRead.access_level` in schema now uses `owner | editor | viewer`
- no active frontend code still depended on old `view | edit` enum values
- `shared/types/api.ts` did not yet expose the new tree/person/relationship DTOs

## What Was Synchronized

### Trees

Synchronized in `src/entities/tree/api/tree-api.ts`:

- kept `getTrees`
- kept `createTree`
- added `updateTree`
- added `deleteTree`
- added `getTreeAccess`
- added `grantTreeAccess`
- added `updateTreeAccess`
- added `revokeTreeAccess`

Also exported current tree-related DTOs from `src/shared/types/api.ts`:

- `TreeUpdate`
- `TreeDeleteResponse`
- `TreeAccessRead`
- `TreeAccessGrantRequest`
- `TreeAccessGrantResponse`
- `TreeAccessUpdateRequest`
- `TreeAccessUpdateResponse`
- `TreeAccessRevokeResponse`
- `TreeAccessLevel`

### Persons

Synchronized in `src/entities/person/api/person-api.ts`:

- kept `createPerson`
- kept `getPersonsByTree`
- kept `getPerson`
- added `updatePerson`
- added `deletePerson`

Also exported:

- `PersonUpdate`
- `PersonDeleteResponse`

### Relationships

Synchronized in `src/entities/relationship/api/relationship-api.ts`:

- kept `createRelationship`
- added `deleteRelationship`

Also exported:

- `RelationshipDeleteResponse`

### Kinship

No contract change was required in `src/entities/kinship/api/kinship-api.ts`.

The current kinship endpoints and query params already match the generated schema.

## Pages That Were Updated

No page changes were required.

Current pages continued to work with the updated schema because:

- tree list/create flow still uses valid endpoints and fields
- person list/detail/create flow still uses valid endpoints and fields
- relationship create flow still uses valid endpoint and fields
- kinship flow was already aligned
- no page still depended on old `view | edit` access level values

## What Is Available In API But Not Yet Connected In UI

Available now in API layer, but not wired into current screens:

- tree update
- tree delete
- tree access management
- person update
- person delete
- relationship delete

These are marked with local TODO comments near the corresponding API functions where UI support is still missing.

## Validation

Commands run:

```bash
npx tsc --noEmit
npm run build
```

Result:

- typecheck passed
- build passed
