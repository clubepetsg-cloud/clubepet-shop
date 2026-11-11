import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Plus, Trash2, X, LogOut, ImagePlus } from "lucide-react";
import logoAsset from "@/assets/clube-pet-logo.png.asset.json";
const logo = logoAsset.url;

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Gerenciar produtos · Clube Pet" },
      { name: "description", content: "Painel para adicionar e editar produtos do Clube Pet." },
      { property: "og:title", content: "Gerenciar produtos · Clube Pet" },
      { property: "og:description", content: "Painel para adicionar e editar produtos do Clube Pet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const CATS = [
  { id: "vestidos", name: "Vestidos" },
  { id: "caminhada", name: "Para Caminhada" },
  { id: "peitoral", name: "Peitoral e Guias" },
  { id: "cuidados", name: "Cuidados e Higiene" },
  { id: "brinquedos", name: "Brinquedos" },
];
const SIZES = ["PP", "P", "M", "G", "GG"];
const FRETE = "Frete grátis para São Gabriel/RS.";

type Row = { id: string; name: string; category: string; price: number; sizes: string[] | null; featured: boolean; photos: string[]; sort_order: number; description: string | null };
type Draft = { id?: string; name: string; category: string; price: string; sizes: string[]; featured: boolean; photos: string[]; description: string };

const input = "w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-[15px] outline-none focus:border-[var(--ink)]";
const btn = "rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-bold text-white active:scale-95 disabled:opacity-50";
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Admin() {
  const [state, setState] = useState<"loading" | "out" | "notadmin" | "admin">("loading");

  const check = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setState("out");
    const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    setState(data ? "admin" : "notadmin");
  };
  useEffect(() => {
    check();
    const { data } = supabase.auth.onAuthStateChange((e) => { if (e === "SIGNED_IN" || e === "SIGNED_OUT") check(); });
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--ink)]">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--line)] bg-white/95 px-4 py-3 backdrop-blur">
        <Link to="/"><img src={logo} alt="Clube Pet" className="w-[70px]" /></Link>
        <span className="font-display text-sm font-bold">Gerenciar produtos</span>
        {state === "admin" || state === "notadmin" ? (
          <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-1 text-sm font-bold text-[var(--ink-soft)]"><LogOut size={16} />Sair</button>
        ) : <span className="w-12" />}
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6">
        {state === "loading" && <p className="text-center text-sm text-[var(--ink-soft)]">Carregando…</p>}
        {state === "out" && <Login />}
        {state === "notadmin" && <p className="rounded-2xl bg-[var(--mint-faint)] p-5 text-center text-sm">Esta conta não tem permissão para gerenciar produtos.</p>}
        {state === "admin" && <Manager />}
      </main>
    </div>
  );
}

function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg("");
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) setMsg("E-mail ou senha incorretos.");
    } else {
      const { error } = await supabase.auth.signUp({ email, password: pass, options: { emailRedirectTo: `${window.location.origin}/admin` } });
      setMsg(error ? error.message : "Conta criada! Confira seu e-mail e clique no link de confirmação.");
    }
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-3 pt-6">
      <h1 className="font-display text-2xl font-extrabold">{mode === "in" ? "Entrar" : "Criar conta da loja"}</h1>
      {mode === "up" && <p className="text-sm text-[var(--ink-soft)]">A primeira conta criada vira a dona da loja.</p>}
      <input className={input} type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className={input} type="password" placeholder="Senha (mín. 6 caracteres)" value={pass} onChange={(e) => setPass(e.target.value)} minLength={6} required />
      <button className={`${btn} w-full`} disabled={busy}>{mode === "in" ? "Entrar" : "Criar conta"}</button>
      {msg && <p className="text-center text-sm">{msg}</p>}
      <button type="button" onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(""); }} className="w-full text-center text-sm font-bold text-[var(--mint-deep)]">
        {mode === "in" ? "Primeira vez? Criar conta" : "Já tenho conta"}
      </button>
    </form>
  );
}

function Manager() {
  const [rows, setRows] = useState<Row[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);

  const load = async () => {
    const { data } = await supabase.from("products").select("*").order("sort_order").order("created_at");
    setRows((data ?? []).map((r) => ({ ...r, price: Number(r.price) })));
  };
  useEffect(() => { load(); }, []);

  const remove = async (r: Row) => {
    if (!confirm(`Apagar "${r.name}"?`)) return;
    await supabase.from("products").delete().eq("id", r.id);
    load();
  };

  return (
    <div>
      <button onClick={() => setDraft({ name: "", category: "vestidos", price: "", sizes: [...SIZES], featured: false, photos: [], description: FRETE })} className={`${btn} flex w-full items-center justify-center gap-2`}>
        <Plus size={18} />Adicionar produto
      </button>
      <p className="mt-5 text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">{rows.length} produtos</p>
      <ul className="mt-2 space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-white p-2.5">
            <img src={r.photos[0]} alt="" className="h-14 w-14 shrink-0 rounded-xl bg-[var(--mint-soft)] object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{r.name}</p>
              <p className="text-xs text-[var(--ink-soft)]">{brl(r.price)} · {CATS.find((c) => c.id === r.category)?.name}{r.sizes?.length ? ` · ${r.sizes.join("/")}` : ""}{r.featured ? " · Destaque" : ""}</p>
            </div>
            <button aria-label="Editar" onClick={() => setDraft({ id: r.id, name: r.name, category: r.category, price: String(r.price).replace(".", ","), sizes: r.sizes ? [...r.sizes] : [], featured: r.featured, photos: r.photos, description: r.description ?? "" })} className="p-2"><Pencil size={18} /></button>
            <button aria-label="Apagar" onClick={() => remove(r)} className="p-2 text-destructive"><Trash2 size={18} /></button>
          </li>
        ))}
      </ul>
      {draft && <Editor draft={draft} nextOrder={rows.length + 1} onClose={() => setDraft(null)} onSaved={() => { setDraft(null); load(); }} />}
    </div>
  );
}

function Editor({ draft, nextOrder, onClose, onSaved }: { draft: Draft; nextOrder: number; onClose: () => void; onSaved: () => void }) {
  const [d, setD] = useState(draft);
  const [extra, setExtra] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true); setErr("");
    const urls: string[] = [];
    for (const f of Array.from(files)) {
      const path = `${crypto.randomUUID()}.${f.name.split(".").pop() || "jpg"}`;
      const { error } = await supabase.storage.from("product-photos").upload(path, f, { contentType: f.type });
      if (error) { setErr("Não foi possível enviar a foto."); continue; }
      const { data } = await supabase.storage.from("product-photos").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (data) urls.push(data.signedUrl);
    }
    setD((x) => ({ ...x, photos: [...x.photos, ...urls] }));
    setBusy(false);
  };

  const addExtra = () => {
    const s = extra.trim();
    if (!s) return;
    if (!d.sizes.includes(s)) setD((x) => ({ ...x, sizes: [...x.sizes, s] }));
    setExtra("");
  };

  const save = async () => {
    const price = Number(d.price.replace(/\./g, "").replace(",", "."));
    if (!d.name.trim() || !price || !d.photos.length) return setErr("Preencha nome, preço e pelo menos uma foto.");
    setBusy(true);
    const order = [...SIZES, ...d.sizes.filter((s) => !SIZES.includes(s))];
    const chosen = d.sizes.filter((s) => s.trim()).sort((a, b) => order.indexOf(a) - order.indexOf(b));
    const row = { name: d.name.trim(), category: d.category, price, sizes: chosen.length ? chosen : null, featured: d.featured, photos: d.photos, description: d.description.trim() || null };
    const { error } = d.id
      ? await supabase.from("products").update(row).eq("id", d.id)
      : await supabase.from("products").insert({ ...row, sort_order: nextOrder });
    setBusy(false);
    if (error) return setErr("Não foi possível salvar.");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 sm:items-center" onClick={onClose}>
      <div className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold">{d.id ? "Editar produto" : "Novo produto"}</h2>
          <button onClick={onClose} aria-label="Fechar"><X /></button>
        </div>
        <div className="mt-4 space-y-3">
          <input className={input} placeholder="Nome (ex: Vestido Lilás)" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} />
          <input className={input} inputMode="decimal" placeholder="Preço (ex: 89,90)" value={d.price} onChange={(e) => setD({ ...d, price: e.target.value })} />
          <select className={input} value={d.category} onChange={(e) => setD({ ...d, category: e.target.value })}>
            {CATS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div>
            <p className="text-sm font-semibold">Descrição</p>
            <textarea className={`${input} mt-1 min-h-[92px] resize-y`} placeholder="Ex: Frete grátis para São Gabriel/RS." value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} />
            <p className="mt-1 text-xs text-[var(--ink-soft)]">Aparece na página do produto e na mensagem do WhatsApp.</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Tamanhos</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[...SIZES, ...d.sizes.filter((s) => !SIZES.includes(s))].map((s) => {
                const on = d.sizes.includes(s);
                return (
                  <button key={s} type="button" aria-pressed={on}
                    onClick={() => setD({ ...d, sizes: on ? d.sizes.filter((x) => x !== s) : [...d.sizes, s] })}
                    className={`rounded-full border px-4 py-2 text-sm font-bold ${on ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--line)] bg-white text-[var(--ink-soft)]"}`}>
                    {s}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex gap-2">
              <input className={input} placeholder="Outro tamanho (ex: Único)" value={extra} onChange={(e) => setExtra(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addExtra(); } }} />
              <button type="button" onClick={addExtra} className="shrink-0 rounded-xl border border-[var(--line)] px-4 text-sm font-bold">Incluir</button>
            </div>
            <p className="mt-1 text-xs text-[var(--ink-soft)]">Toque só nos tamanhos que esse produto tem. Sem nenhum marcado = tamanho único.</p>
          </div>
          <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" className="h-5 w-5" checked={d.featured} onChange={(e) => setD({ ...d, featured: e.target.checked })} />Mostrar em Destaque</label>
          <div>
            <p className="text-sm font-semibold">Fotos</p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {d.photos.map((u, i) => (
                <div key={u} className="relative">
                  <img src={u} alt="" className="aspect-square w-full rounded-xl object-cover" />
                  <button onClick={() => setD({ ...d, photos: d.photos.filter((_, j) => j !== i) })} aria-label="Remover foto" className="absolute right-1 top-1 rounded-full bg-white p-0.5 shadow"><X size={14} /></button>
                </div>
              ))}
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--line)] text-[var(--ink-soft)]">
                <ImagePlus size={22} /><span className="text-[10px] font-bold">Adicionar</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
              </label>
            </div>
          </div>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button onClick={save} disabled={busy} className={`${btn} w-full`}>{busy ? "Aguarde…" : "Salvar"}</button>
        </div>
      </div>
    </div>
  );
}
