import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createPerson,
  createRelationship,
  createTree,
  getGraphPath,
  getKinship,
  getPerson,
  getPersonsByTree,
  getTrees,
  loginUser,
  registerUser
} from "../shared/api";
import { subscribeToAuthFailure } from "../shared/api/client";
import { getErrorMessage } from "../shared/api/errors";
import type { components } from "../shared/api/generated/schema";
import { clearTokens, readTokens } from "../shared/api/token-storage";

type TreeRead = components["schemas"]["TreeRead"];
type PersonRead = components["schemas"]["PersonRead"];
type Gender = NonNullable<components["schemas"]["PersonCreate"]["gender"]>;
type RelationshipType = components["schemas"]["RelationshipCreate"]["relationship_type"];

const emptyTreeForm: components["schemas"]["TreeCreate"] = {
  name: "",
  description: "",
  is_public: false
};

const emptyPersonForm = (treeId: number | null): components["schemas"]["PersonCreate"] => ({
  first_name: "",
  middle_name: "",
  last_name: "",
  birth_date: "",
  death_date: "",
  description: "",
  photo_url: "",
  gender: null,
  tree_id: treeId ?? 0
});

export function App() {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState<components["schemas"]["UserLogin"]>({
    email: "",
    password: ""
  });
  const [status, setStatus] = useState("Ready");
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(readTokens()?.accessToken));
  const [trees, setTrees] = useState<TreeRead[]>([]);
  const [selectedTreeId, setSelectedTreeId] = useState<number | null>(null);
  const [persons, setPersons] = useState<PersonRead[]>([]);
  const [personPreview, setPersonPreview] = useState<PersonRead | null>(null);
  const [treeForm, setTreeForm] = useState(emptyTreeForm);
  const [personForm, setPersonForm] = useState(emptyPersonForm(null));
  const [relationshipForm, setRelationshipForm] = useState<components["schemas"]["RelationshipCreate"]>({
    from_person_id: 0,
    to_person_id: 0,
    relationship_type: "parent"
  });
  const [pathForm, setPathForm] = useState({
    from_person_id: 0,
    to_person_id: 0
  });
  const [graphPathResult, setGraphPathResult] = useState("");
  const [kinshipResult, setKinshipResult] = useState("");

  useEffect(() => {
    return subscribeToAuthFailure((code) => {
      setIsAuthenticated(false);
      setTrees([]);
      setPersons([]);
      setSelectedTreeId(null);
      setPersonPreview(null);
      setStatus(`Authorization failed with ${code}. Tokens were cleared.`);
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void refreshTrees();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setPersonForm(emptyPersonForm(selectedTreeId));
    if (!selectedTreeId) {
      setPersons([]);
      return;
    }

    void refreshPersons(selectedTreeId);
  }, [selectedTreeId]);

  const personOptions = useMemo(
    () =>
      persons.map((person) => ({
        value: person.id,
        label: `${person.first_name} ${person.last_name ?? ""}`.trim()
      })),
    [persons]
  );

  async function refreshTrees() {
    try {
      const data = await getTrees();
      setTrees(data);
      setSelectedTreeId((current) => current ?? data[0]?.id ?? null);
      setStatus(`Loaded ${data.length} tree(s).`);
    } catch (error) {
      setStatus(getErrorMessage(error));
    }
  }

  async function refreshPersons(treeId: number) {
    try {
      const data = await getPersonsByTree(treeId);
      setPersons(data);
      setStatus(`Loaded ${data.length} person(s) for tree #${treeId}.`);
    } catch (error) {
      setStatus(getErrorMessage(error));
    }
  }

  async function onAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (authMode === "register") {
        const result = await registerUser(authForm);
        setStatus(result.detail);
        setAuthMode("login");
        return;
      }

      const result = await loginUser(authForm);
      setIsAuthenticated(true);
      setStatus(`Logged in. Token type: ${result.token_type}.`);
    } catch (error) {
      setStatus(getErrorMessage(error));
    }
  }

  async function onCreateTree(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const result = await createTree(treeForm);
      setTreeForm(emptyTreeForm);
      await refreshTrees();
      setSelectedTreeId(result.tree_id);
      setStatus(`Created tree #${result.tree_id}.`);
    } catch (error) {
      setStatus(getErrorMessage(error));
    }
  }

  async function onCreatePerson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTreeId) {
      setStatus("Select a tree before creating a person.");
      return;
    }

    try {
      const result = await createPerson({
        ...personForm,
        tree_id: selectedTreeId,
        middle_name: personForm.middle_name || null,
        last_name: personForm.last_name || null,
        birth_date: personForm.birth_date || null,
        death_date: personForm.death_date || null,
        description: personForm.description || null,
        photo_url: personForm.photo_url || null
      });

      await refreshPersons(selectedTreeId);
      setPersonForm(emptyPersonForm(selectedTreeId));
      setStatus(`Created person #${result.person_id}.`);
    } catch (error) {
      setStatus(getErrorMessage(error));
    }
  }

  async function onCreateRelationship(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const result = await createRelationship(relationshipForm);
      setStatus(`Created relationship #${result.relationship_id}.`);
    } catch (error) {
      setStatus(getErrorMessage(error));
    }
  }

  async function onFindPath(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTreeId) {
      setStatus("Select a tree before path search.");
      return;
    }

    try {
      const result = await getGraphPath({
        tree_id: selectedTreeId,
        ...pathForm
      });
      setGraphPathResult(result.path.join(" -> "));
      setStatus("Graph path loaded.");
    } catch (error) {
      setStatus(getErrorMessage(error));
    }
  }

  async function onFindKinship() {
    if (!selectedTreeId) {
      setStatus("Select a tree before kinship search.");
      return;
    }

    try {
      const result = await getKinship({
        tree_id: selectedTreeId,
        ...pathForm
      });
      setKinshipResult(`${result.result} | ${result.line}`);
      setStatus("Kinship loaded.");
    } catch (error) {
      setStatus(getErrorMessage(error));
    }
  }

  async function onLoadPerson(personId: number) {
    try {
      const result = await getPerson(personId);
      setPersonPreview(result);
      setStatus(`Loaded person #${personId}.`);
    } catch (error) {
      setStatus(getErrorMessage(error));
    }
  }

  function onLogout() {
    clearTokens();
    setIsAuthenticated(false);
    setTrees([]);
    setPersons([]);
    setSelectedTreeId(null);
    setPersonPreview(null);
    setStatus("Logged out.");
  }

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">LifeAfterLife</p>
          <h1>Frontend wired to OpenAPI, not backend internals.</h1>
          <p className="lead">
            Every request goes through one typed HTTP client. If an endpoint is missing from the
            spec, we do not invent it in the UI.
          </p>
        </div>
        <div className="status-card">
          <span className="status-label">Status</span>
          <strong>{status}</strong>
          <span>{isAuthenticated ? "Authorized session" : "Guest session"}</span>
        </div>
      </section>

      <section className="grid">
        <article className="panel">
          <div className="panel-header">
            <h2>Auth</h2>
            <div className="segmented">
              <button
                className={authMode === "login" ? "active" : ""}
                onClick={() => setAuthMode("login")}
                type="button"
              >
                Login
              </button>
              <button
                className={authMode === "register" ? "active" : ""}
                onClick={() => setAuthMode("register")}
                type="button"
              >
                Register
              </button>
            </div>
          </div>
          <form className="stack" onSubmit={onAuthSubmit}>
            <label>
              Email
              <input
                type="email"
                value={authForm.email}
                onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={authForm.password}
                onChange={(event) =>
                  setAuthForm((current) => ({ ...current, password: event.target.value }))
                }
              />
            </label>
            <button type="submit">{authMode === "login" ? "Sign in" : "Create account"}</button>
            <button type="button" className="ghost" onClick={onLogout}>
              Clear session
            </button>
          </form>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Trees</h2>
            <button type="button" className="ghost" onClick={() => void refreshTrees()}>
              Reload
            </button>
          </div>
          <form className="stack" onSubmit={onCreateTree}>
            <label>
              Name
              <input
                value={treeForm.name}
                onChange={(event) => setTreeForm((current) => ({ ...current, name: event.target.value }))}
              />
            </label>
            <label>
              Description
              <textarea
                rows={3}
                value={treeForm.description ?? ""}
                onChange={(event) =>
                  setTreeForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </label>
            <label className="inline">
              <input
                type="checkbox"
                checked={treeForm.is_public ?? false}
                onChange={(event) =>
                  setTreeForm((current) => ({ ...current, is_public: event.target.checked }))
                }
              />
              Public tree
            </label>
            <button type="submit">Create tree</button>
          </form>
          <div className="list">
            {trees.map((tree) => (
              <button
                key={tree.id}
                type="button"
                className={`list-item ${selectedTreeId === tree.id ? "selected" : ""}`}
                onClick={() => setSelectedTreeId(tree.id)}
              >
                <strong>{tree.name}</strong>
                <span>
                  #{tree.id} | {tree.access_level}
                </span>
              </button>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Persons</h2>
            <span>{selectedTreeId ? `Tree #${selectedTreeId}` : "No tree selected"}</span>
          </div>
          <form className="stack" onSubmit={onCreatePerson}>
            <label>
              First name
              <input
                value={personForm.first_name}
                onChange={(event) =>
                  setPersonForm((current) => ({ ...current, first_name: event.target.value }))
                }
              />
            </label>
            <label>
              Last name
              <input
                value={personForm.last_name ?? ""}
                onChange={(event) =>
                  setPersonForm((current) => ({ ...current, last_name: event.target.value }))
                }
              />
            </label>
            <label>
              Gender
              <select
                value={personForm.gender ?? ""}
                onChange={(event) =>
                  setPersonForm((current) => ({
                    ...current,
                    gender: (event.target.value || null) as Gender | null
                  }))
                }
              >
                <option value="">Unknown</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>
              Description
              <textarea
                rows={3}
                value={personForm.description ?? ""}
                onChange={(event) =>
                  setPersonForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </label>
            <button type="submit">Create person</button>
          </form>
          <div className="list">
            {personOptions.map((person) => (
              <button
                key={person.value}
                type="button"
                className="list-item"
                onClick={() => void onLoadPerson(person.value)}
              >
                <strong>{person.label || `Person #${person.value}`}</strong>
                <span>ID {person.value}</span>
              </button>
            ))}
          </div>
          {personPreview ? (
            <div className="preview">
              <strong>
                {personPreview.first_name} {personPreview.last_name ?? ""}
              </strong>
              <span>ID: {personPreview.id}</span>
              <span>{personPreview.description || "No description in API response."}</span>
            </div>
          ) : null}
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Relations</h2>
            <span>Typed mutation flow</span>
          </div>
          <form className="stack" onSubmit={onCreateRelationship}>
            <label>
              From person ID
              <input
                type="number"
                value={relationshipForm.from_person_id || ""}
                onChange={(event) =>
                  setRelationshipForm((current) => ({
                    ...current,
                    from_person_id: Number(event.target.value)
                  }))
                }
              />
            </label>
            <label>
              To person ID
              <input
                type="number"
                value={relationshipForm.to_person_id || ""}
                onChange={(event) =>
                  setRelationshipForm((current) => ({
                    ...current,
                    to_person_id: Number(event.target.value)
                  }))
                }
              />
            </label>
            <label>
              Type
              <select
                value={relationshipForm.relationship_type}
                onChange={(event) =>
                  setRelationshipForm((current) => ({
                    ...current,
                    relationship_type: event.target.value as RelationshipType
                  }))
                }
              >
                <option value="parent">parent</option>
                <option value="spouse">spouse</option>
                <option value="sibling">sibling</option>
                <option value="friend">friend</option>
              </select>
            </label>
            <button type="submit">Create relationship</button>
          </form>
        </article>

        <article className="panel panel-wide">
          <div className="panel-header">
            <h2>Path & kinship</h2>
            <span>Read-only graph endpoints from OpenAPI</span>
          </div>
          <form className="duo" onSubmit={onFindPath}>
            <label>
              From person ID
              <input
                type="number"
                value={pathForm.from_person_id || ""}
                onChange={(event) =>
                  setPathForm((current) => ({
                    ...current,
                    from_person_id: Number(event.target.value)
                  }))
                }
              />
            </label>
            <label>
              To person ID
              <input
                type="number"
                value={pathForm.to_person_id || ""}
                onChange={(event) =>
                  setPathForm((current) => ({
                    ...current,
                    to_person_id: Number(event.target.value)
                  }))
                }
              />
            </label>
            <button type="submit">Find graph path</button>
            <button type="button" className="ghost" onClick={() => void onFindKinship()}>
              Find kinship
            </button>
          </form>
          <div className="result-grid">
            <div className="result-box">
              <span>Path</span>
              <strong>{graphPathResult || "No data yet"}</strong>
            </div>
            <div className="result-box">
              <span>Kinship</span>
              <strong>{kinshipResult || "No data yet"}</strong>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
