import type { components, paths } from "../api/generated/schema";

export type ApiPaths = paths;
export type ApiComponents = components;

export type UserCreate = components["schemas"]["UserCreate"];
export type UserLogin = components["schemas"]["UserLogin"];
export type UserLoginResponse = components["schemas"]["UserLoginResponse"];
export type UserRegistrationResponse = components["schemas"]["UserRegistrationResponse"];
export type UserLoginResponseTokenType = UserLoginResponse["token_type"];

export type TreeCreate = components["schemas"]["TreeCreate"];
export type TreeCreateResponse = components["schemas"]["TreeCreateResponse"];
export type TreeUpdate = components["schemas"]["TreeUpdate"];
export type TreeDeleteResponse = components["schemas"]["TreeDeleteResponse"];
export type TreeRead = components["schemas"]["TreeRead"];
export type TreeAccessRead = components["schemas"]["TreeAccessRead"];
export type TreeAccessGrantRequest = components["schemas"]["TreeAccessGrantRequest"];
export type TreeAccessGrantResponse = components["schemas"]["TreeAccessGrantResponse"];
export type TreeAccessUpdateRequest = components["schemas"]["TreeAccessUpdateRequest"];
export type TreeAccessUpdateResponse = components["schemas"]["TreeAccessUpdateResponse"];
export type TreeAccessRevokeResponse = components["schemas"]["TreeAccessRevokeResponse"];
export type TreeAccessLevel = TreeRead["access_level"];

export type PersonCreate = components["schemas"]["PersonCreate"];
export type PersonCreateResponse = components["schemas"]["PersonCreateResponse"];
export type PersonRead = components["schemas"]["PersonRead"];
export type PersonUpdate = components["schemas"]["PersonUpdate"];
export type PersonDeleteResponse = components["schemas"]["PersonDeleteResponse"];

export type RelationshipCreate = components["schemas"]["RelationshipCreate"];
export type RelationshipCreateResponse = components["schemas"]["RelationshipCreateResponse"];
export type RelationshipDeleteResponse = components["schemas"]["RelationshipDeleteResponse"];

export type GraphPathResponse = components["schemas"]["GraphPathResponse"];
export type KinshipResponse = components["schemas"]["KinshipResponse"];
