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
export type TreeRead = components["schemas"]["TreeRead"];

export type PersonCreate = components["schemas"]["PersonCreate"];
export type PersonCreateResponse = components["schemas"]["PersonCreateResponse"];
export type PersonRead = components["schemas"]["PersonRead"];

export type RelationshipCreate = components["schemas"]["RelationshipCreate"];
export type RelationshipCreateResponse = components["schemas"]["RelationshipCreateResponse"];

export type GraphPathResponse = components["schemas"]["GraphPathResponse"];
export type KinshipResponse = components["schemas"]["KinshipResponse"];
