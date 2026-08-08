import { useEffect, useState } from 'react';
import { BookOpen, Edit, Loader2, Plus, Save, Trash2, X } from 'lucide-react';
import { Research, supabase } from '../lib/supabase';
import { FileUpload } from './FileUpload';

const emptyForm = {
  title: '', authors: '', journal: '', publication_date: '', abstract: '', keywords: '',
  doi_url: '', paper_url: '', image_url: '', display_order: 0, is_published: true,
};

export function ResearchManager() {
  const [items, setItems] = useState<Research[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const { data, error } = await supabase.from('research').select('*').order('display_order', { ascending: true });
    if (error) setError(error.message || 'Failed to load research.');
    else setItems(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const reset = () => { setForm({ ...emptyForm, display_order: items.length + 1 }); setEditingId(null); setShowForm(false); };
  const edit = (r: Research) => {
    setForm({
      title:r.title, authors:(r.authors||[]).join(', '), journal:r.journal||'', publication_date:r.publication_date||'',
      abstract:r.abstract||'', keywords:(r.keywords||[]).join(', '), doi_url:r.doi_url||'', paper_url:r.paper_url||'',
      image_url:r.image_url||'', display_order:r.display_order||0, is_published:r.is_published !== false,
    });
    setEditingId(r.id); setShowForm(true);
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    const payload = {
      ...form,
      authors: form.authors.split(',').map(v=>v.trim()).filter(Boolean),
      keywords: form.keywords.split(',').map(v=>v.trim()).filter(Boolean),
    };
    const result = editingId
      ? await supabase.from('research').update(payload).eq('id', editingId)
      : await supabase.from('research').insert(payload);
    setSaving(false);
    if (result.error) return setError(result.error.message || 'Could not save research.');
    await load(); reset();
  };
  const remove = async (id: string) => {
    if (!confirm('Delete this research publication?')) return;
    const { error } = await supabase.from('research').delete().eq('id', id);
    if (error) setError(error.message || 'Could not delete research.'); else load();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-400" /></div>;
  return <div className="space-y-6">
    <div className="flex items-center justify-between gap-4">
      <div><h2 className="text-2xl font-bold text-white">Published Research</h2><p className="mt-1 text-sm text-gray-400">Add and manage publications shown on the public Research page.</p></div>
      <button onClick={()=>{ reset(); setShowForm(true); }} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 font-semibold text-[#0b0614]"><Plus size={18}/> Add Research</button>
    </div>
    {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-300">{error}</div>}
    {showForm && <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-[#322044] bg-[#160b24] p-5 md:grid-cols-2">
      <div className="md:col-span-2 flex items-center justify-between"><h3 className="font-bold text-white">{editingId?'Edit Research':'New Research'}</h3><button type="button" onClick={reset}><X/></button></div>
      <input required placeholder="Research title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="rounded-xl border border-[#452c5d] bg-[#0b0614] p-3 text-white md:col-span-2" />
      <input placeholder="Authors, comma separated" value={form.authors} onChange={e=>setForm({...form,authors:e.target.value})} className="rounded-xl border border-[#452c5d] bg-[#0b0614] p-3 text-white" />
      <input placeholder="Journal / Conference" value={form.journal} onChange={e=>setForm({...form,journal:e.target.value})} className="rounded-xl border border-[#452c5d] bg-[#0b0614] p-3 text-white" />
      <input placeholder="Publication date (e.g. Apr 2026)" value={form.publication_date} onChange={e=>setForm({...form,publication_date:e.target.value})} className="rounded-xl border border-[#452c5d] bg-[#0b0614] p-3 text-white" />
      <input type="number" placeholder="Display order" value={form.display_order} onChange={e=>setForm({...form,display_order:Number(e.target.value)})} className="rounded-xl border border-[#452c5d] bg-[#0b0614] p-3 text-white" />
      <textarea placeholder="Abstract / summary" rows={6} value={form.abstract} onChange={e=>setForm({...form,abstract:e.target.value})} className="rounded-xl border border-[#452c5d] bg-[#0b0614] p-3 text-white md:col-span-2" />
      <input placeholder="Keywords, comma separated" value={form.keywords} onChange={e=>setForm({...form,keywords:e.target.value})} className="rounded-xl border border-[#452c5d] bg-[#0b0614] p-3 text-white md:col-span-2" />
      <input placeholder="DOI URL" value={form.doi_url} onChange={e=>setForm({...form,doi_url:e.target.value})} className="rounded-xl border border-[#452c5d] bg-[#0b0614] p-3 text-white" />
      <input placeholder="Paper / publisher URL" value={form.paper_url} onChange={e=>setForm({...form,paper_url:e.target.value})} className="rounded-xl border border-[#452c5d] bg-[#0b0614] p-3 text-white" />
      <div className="md:col-span-2"><FileUpload label="Research paper PDF (optional — replaces Paper URL)" value={form.paper_url} onChange={(url)=>setForm({...form,paper_url:url})} folder="research/papers" accept="pdf" /></div>
      <div className="md:col-span-2"><FileUpload label="Research cover / figure (optional)" value={form.image_url} onChange={(url)=>setForm({...form,image_url:url})} folder="research" accept="image" /></div>
      <label className="flex items-center gap-2 text-gray-300"><input type="checkbox" checked={form.is_published} onChange={e=>setForm({...form,is_published:e.target.checked})}/> Show publicly</label>
      <div className="md:col-span-2 flex gap-3"><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 font-bold text-[#0b0614]"><Save size={18}/>{saving?'Saving...':'Save'}</button><button type="button" onClick={reset} className="rounded-xl bg-[#211032] px-5 py-2.5">Cancel</button></div>
    </form>}
    <div className="space-y-3">{items.map(r=><div key={r.id} className="flex flex-col gap-4 rounded-2xl border border-[#322044] bg-[#160b24] p-5 md:flex-row md:items-center">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400"><BookOpen/></div>
      <div className="min-w-0 flex-1"><h3 className="font-bold text-white">{r.title}</h3><p className="mt-1 text-sm text-gray-400">{r.journal}{r.publication_date?` • ${r.publication_date}`:''}</p><p className="mt-1 text-xs text-gray-500">{r.is_published?'Published on portfolio':'Hidden'}</p></div>
      <div className="flex gap-2"><button onClick={()=>edit(r)} className="rounded-lg bg-[#211032] p-2 text-gray-300"><Edit size={18}/></button><button onClick={()=>remove(r.id)} className="rounded-lg bg-red-500/10 p-2 text-red-300"><Trash2 size={18}/></button></div>
    </div>)}</div>
  </div>;
}
