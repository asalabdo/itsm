import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import entities from './entities';
import schemas from './schemas';
import Button from 'components/ui/Button';

const storageKey = (entityKey) => `crud:${entityKey}`;

const ListView = ({ entityKey }) => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const schema = schemas[entityKey];

  useEffect(() => {
    const raw = localStorage.getItem(storageKey(entityKey));
    setItems(raw ? JSON.parse(raw) : []);
  }, [entityKey]);

  const remove = (id) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    localStorage.setItem(storageKey(entityKey), JSON.stringify(next));
  };

  const primaryField = schema?.fields?.[0]?.key || 'id';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{schema?.label || entityKey}</h2>
        <div>
          <Button asChild>
            <Link to="new">Create</Link>
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground">No items yet.</div>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.id} className="p-3 border rounded flex items-center justify-between">
              <div>
                <div className="font-medium">{it[primaryField] || `Item ${it.id}`}</div>
                <div className="text-xs text-muted-foreground">{it.description}</div>
              </div>
              <div className="space-x-2">
                <Button asChild size="sm">
                  <Link to={`edit/${it.id}`}>Edit</Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => remove(it.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FormView = ({ entityKey }) => {
  const { '*': rest } = useParams();
  const isNew = rest?.startsWith('new');
  const editId = rest?.startsWith('edit/') ? rest.split('/')[1] : null;
  const schema = schemas[entityKey];
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNew && editId) {
      const raw = localStorage.getItem(storageKey(entityKey));
      const items = raw ? JSON.parse(raw) : [];
      const found = items.find((i) => i.id === Number(editId));
      if (found) setForm(found);
    } else {
      // default form
      const defaults = {};
      schema?.fields?.forEach((f) => {
        defaults[f.key] = f.type === 'multiselect' ? [] : f.type === 'json' ? {} : '';
      });
      setForm(defaults);
    }
  }, [entityKey, isNew, editId, schema]);

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  // helper to load related options from storage
  const loadOptions = (relation) => {
    const raw = localStorage.getItem(storageKey(relation));
    const items = raw ? JSON.parse(raw) : [];
    return items;
  };

  const save = () => {
    const raw = localStorage.getItem(storageKey(entityKey));
    const items = raw ? JSON.parse(raw) : [];
    if (isNew) {
      const id = Date.now();
      const next = [{ id, ...form }, ...items];
      localStorage.setItem(storageKey(entityKey), JSON.stringify(next));
    } else {
      const next = items.map((i) => (i.id === Number(editId) ? { ...i, ...form } : i));
      localStorage.setItem(storageKey(entityKey), JSON.stringify(next));
    }
    navigate(`/manage/${entityKey}`);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{isNew ? 'Create' : 'Edit'} {schema?.label || entityKey}</h2>
      <div className="space-y-4 max-w-2xl">
        {schema?.fields?.map((field) => {
          const val = form?.[field.key];
          if (field.type === 'text' || field.type === 'number' || field.type === 'datetime') {
            return (
              <div key={field.key}>
                <label className="block text-sm font-medium">{field.label}</label>
                <input
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={val || ''}
                  onChange={(e) => setField(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                  className="mt-1 block w-full border rounded p-2"
                />
              </div>
            );
          }

          if (field.type === 'textarea') {
            return (
              <div key={field.key}>
                <label className="block text-sm font-medium">{field.label}</label>
                <textarea value={val || ''} onChange={(e) => setField(field.key, e.target.value)} className="mt-1 block w-full border rounded p-2" />
              </div>
            );
          }

          if (field.type === 'json') {
            return (
              <div key={field.key}>
                <label className="block text-sm font-medium">{field.label}</label>
                <textarea value={JSON.stringify(val || {}, null, 2)} onChange={(e) => {
                  try { setField(field.key, JSON.parse(e.target.value)); } catch { }
                }} className="mt-1 block w-full border rounded p-2 font-mono text-xs" rows={6} />
              </div>
            );
          }

          if (field.type === 'select' || field.type === 'multiselect') {
            const options = field.relation ? loadOptions(field.relation) : (field.options || []);
            return (
              <div key={field.key}>
                <label className="block text-sm font-medium">{field.label}</label>
                {field.type === 'select' ? (
                  <select value={val || ''} onChange={(e) => setField(field.key, e.target.value)} className="mt-1 block w-full border rounded p-2">
                    <option value="">--</option>
                    {options.map((o) => (
                      <option key={o.id || o} value={o.id ?? o}>{o.name ?? o}</option>
                    ))}
                  </select>
                ) : (
                  <input value={(val || []).join(',')} onChange={(e) => setField(field.key, e.target.value.split(',').map((s) => s.trim()))} className="mt-1 block w-full border rounded p-2" />
                )}
              </div>
            );
          }

          // fallback
          return null;
        })}

        <div className="space-x-2">
          <Button onClick={save}>{isNew ? 'Create' : 'Save'}</Button>
          <Button variant="ghost" asChild>
            <Link to={`/manage/${entityKey}`}>Cancel</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

const CRUDPage = () => {
  const { entityKey } = useParams();
  const location = useLocation();
  const entity = entities.find((e) => e.key === entityKey);
  if (!entity) return <div>Unknown entity</div>;

  // Determine mode from the tail of the path
  const tail = location.pathname.replace(`/manage/${entityKey}`, '').replace(/^\//, '');
  if (tail.startsWith('new')) return <FormView entityKey={entityKey} />;
  if (tail.startsWith('edit/')) return <FormView entityKey={entityKey} />;
  return <ListView entityKey={entityKey} />;
};

export default CRUDPage;
