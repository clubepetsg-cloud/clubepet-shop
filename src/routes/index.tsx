import { createFileRoute } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useRef, useState, type ComponentType } from "react";
import { supabase } from "@/integrations/supabase/client";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Check, ChevronLeft, ChevronRight, Dog, Footprints, House, MessageCircle, Minus,
  PawPrint, Plus, Shirt, ShoppingBag, Sparkles, ToyBrick, Users, X,
} from "lucide-react";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clube Pet · um clube feito pra eles" },
      { name: "description", content: "Roupinhas, acessórios e brinquedos para pets. Peça pelo WhatsApp." },
      { property: "og:title", content: "Clube Pet · um clube feito pra eles" },
      { property: "og:description", content: "Roupinhas, acessórios e brinquedos para pets. Peça pelo WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: App,
});

const WA = "https://wa.me/5555997149598";
const GROUP = "https://chat.whatsapp.com/HtckEUwrpXlEZHOGWZdvXG";
const SIZES = ["PP", "P", "M", "G", "GG"];
const img = (s: string) => `https://i.postimg.cc/${s}.jpg`;

type Cat = { id: string; name: string; tagline: string; icon: ComponentType<{ size?: number }>; cover: string };
type Product = { id: string; name: string; category: string; price: number; sizes: string[] | null; featured?: boolean; photos: string[] };

const CATS: Cat[] = [
  { id: "vestidos", name: "Vestidos", tagline: "Charme para todas as ocasiões", icon: Shirt, cover: img("tJWygM4j/IMG-2516") },
  { id: "caminhada", name: "Para Caminhada", tagline: "Conforto no passeio", icon: Footprints, cover: img("kMtPMhT8/IMG-2477") },
  { id: "peitoral", name: "Peitoral e Guias", tagline: "Segurança com estilo", icon: Dog, cover: img("dt4BbJ8w/IMG-2462") },
  { id: "cuidados", name: "Cuidados e Higiene", tagline: "Escovas e carinho no dia a dia", icon: Sparkles, cover: img("PxXNnnW6/IMG-2446") },
  { id: "brinquedos", name: "Brinquedos", tagline: "Diversão garantida", icon: ToyBrick, cover: img("vBYDww7F/IMG-2441") },
];

const v = (id: string, name: string, a: string, b: string, featured = false): Product => ({
  id, name, category: "vestidos", price: 89.9, sizes: SIZES, featured, photos: [img(a), img(b)],
});
const STATIC_PRODUCTS: Product[] = [
  v("vestido-fada", "Vestido Fada", "tJWygM4j/IMG-2516", "05w9Zbdc/IMG-2517", true),
  v("vestido-roxo-laco", "Vestido Roxo Laço", "t4X1LhBp/IMG-2512", "T3RyZrty/IMG-2513"),
  v("vestido-creme", "Vestido Creme", "tRk82Qvd/IMG-2510", "dQ6g4PN2/IMG-2511"),
  v("vestido-creme-top", "Vestido Creme com Top", "XqP8m8CN/IMG-2508", "hvYr6rdD/IMG-2509"),
  v("vestido-babado-roxo", "Vestido Babado Roxo", "QMMq8wJt/IMG-2482", "MGGY6Nmf/IMG-2483"),
  v("vestido-rosa-princesa", "Vestido Rosa Princesa", "BnpgG4HJ/IMG-2485", "XvvgjmkW/IMG-2487", true),
  v("vestido-fadinha", "Vestido Fadinha", "bwgTjpb5/IMG-2488", "BnpgG4DR/IMG-2490"),
  v("vestido-top-rosa", "Vestido Top Rosa", "DwngD8W1/IMG-2491", "DwngD8W5/IMG-2492"),
  v("vestido-perolas", "Vestido com Pérolas", "nhpk5CsL/IMG-2493", "kgqcZBVg/IMG-2494"),
  v("vestido-borboleta-verde", "Vestido Borboleta Verde", "4NzPBz3R/IMG-2501", "bNQg3QvN/IMG-2502"),
  v("vestido-borboleta-rosa", "Vestido Borboleta Rosa", "KvXQP9xf/IMG-2504", "VLy4q7mW/IMG-2505"),
  v("vestido-perolas-pequeno", "Vestido Pérolas Pequeno", "ZKkj8f4j/IMG-2506", "VLy4q7mK/IMG-2507"),
  { id: "adidog-verde", name: "Adidog Verde", category: "caminhada", price: 34.99, sizes: SIZES, photos: [img("kMtPMhT8/IMG-2477")] },
  { id: "adidog-rosa", name: "Adidog Rosa", category: "caminhada", price: 34.99, sizes: SIZES, featured: true, photos: [img("ryt2yYf4/IMG-2480")] },
  { id: "peitoral-mochila-1", name: "Peitoral Mochila 1", category: "peitoral", price: 35, sizes: null, photos: [img("dt4BbJ8w/IMG-2462")] },
  { id: "peitoral-mochila-2", name: "Peitoral Mochila 2", category: "peitoral", price: 35, sizes: null, photos: [img("4NB5DXzJ/IMG-2465")] },
  { id: "peitoral-com-top", name: "Peitoral com Top", category: "peitoral", price: 35, sizes: null, photos: [img("Hsx57XyC/IMG-2455")] },
  { id: "bolinha-automatica", name: "Bolinha Automática", category: "brinquedos", price: 19.9, sizes: null, featured: true, photos: [img("vBYDww7F/IMG-2441"), img("zBz3YYCs/IMG-2443")] },
  { id: "escova-fluffie", name: "Escova Massageadora Fluffie", category: "cuidados", price: 24.99, sizes: null, photos: [img("PxXNnnW6/IMG-2446"), img("RFSqxx7d/IMG-2447")] },
  { id: "roleta-petisco", name: "Roleta de Petisco", category: "brinquedos", price: 49.9, sizes: null, photos: [img("NMsLvv6J/IMG-2451"), img("vBYDwwr0/IMG-2452")] },
];

const ProductsCtx = createContext<Product[]>(STATIC_PRODUCTS);

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const catOf = (p: Product) => CATS.find((c) => c.id === p.category)!;
const waBtn = "flex w-full items-center justify-center gap-2 rounded-full bg-[var(--wa)] py-4 text-base font-bold text-white shadow-lg shadow-green-100 transition-transform active:scale-[0.99]";

function Img({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const [err, setErr] = useState(false);
  if (err)
    return (
      <div role="img" aria-label={alt} className={`flex flex-col items-center justify-center gap-2 bg-[var(--mint-soft)] p-4 text-[var(--mint-deep)] ${className}`}>
        <PawPrint size={34} strokeWidth={1.75} />
        <span className="text-center text-xs font-bold leading-snug">{alt}</span>
      </div>
    );
  return <img src={src} alt={alt} loading="lazy" draggable={false} referrerPolicy="no-referrer" onError={() => setErr(true)} className={className} />;
}

function Card({ product, onSelect }: { product: Product; onSelect: () => void }) {
  return (
    <button onClick={onSelect} className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white text-left transition-transform duration-150 active:scale-[0.98]">
      <div className="relative aspect-[4/5] bg-[var(--mint-soft)]">
        <Img src={product.photos[0] ?? ""} alt={product.name} className="h-full w-full object-cover" />
        {product.photos.length > 1 && (
          <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold text-white">{product.photos.length} fotos</span>
        )}
      </div>
      <div className="p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--mint-deep)]">{catOf(product).name}</p>
        <h3 className="font-display mt-0.5 text-[15px] font-bold leading-snug">{product.name}</h3>
        <p className="mt-1 text-[15px] font-extrabold">{brl(product.price)}</p>
      </div>
    </button>
  );
}

function Lightbox({ photos, name, index, setIndex, onClose }: { photos: string[]; name: string; index: number; setIndex: (f: (i: number) => number) => void; onClose: () => void }) {
  const n = photos.length;
  const touch = useRef<number | null>(null);
  const [ok, setOk] = useState(true);
  useEffect(() => setOk(true), [index]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") setIndex((d) => (d + 1) % n);
      else if (e.key === "ArrowLeft") setIndex((d) => (d - 1 + n) % n);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [n, onClose, setIndex]);
  return (
    <div
      className="pointer-events-auto fixed inset-0 z-[80] flex flex-col bg-black" role="dialog" aria-modal="true" aria-label={`Foto ampliada de ${name}`}
      onTouchStart={(e) => (touch.current = e.touches[0]!.clientX)}
      onTouchEnd={(e) => {
        if (touch.current == null) return;
        const d = e.changedTouches[0]!.clientX - touch.current;
        if (Math.abs(d) > 48) setIndex((i) => (i + (d < 0 ? 1 : -1) + n) % n);
        touch.current = null;
      }}
    >
      <div className="flex items-center justify-between p-4">
        <span className="text-sm font-bold text-white/80">{index + 1} / {n}</span>
        <button onClick={onClose} aria-label="Fechar foto ampliada" className="rounded-full bg-white/10 p-2.5 text-white hover:bg-white/25"><X size={24} /></button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2">
        {n > 1 && <button onClick={() => setIndex((i) => (i - 1 + n) % n)} aria-label="Foto anterior" className="absolute left-3 z-10 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/25"><ChevronLeft size={28} /></button>}
        {ok ? (
          <img src={photos[index]} alt={name} draggable={false} referrerPolicy="no-referrer" onError={() => setOk(false)} className="max-h-full max-w-full select-none object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-3 text-white/60"><PawPrint size={52} strokeWidth={1.5} /><span className="text-sm font-bold">{name}</span></div>
        )}
        {n > 1 && <button onClick={() => setIndex((i) => (i + 1) % n)} aria-label="Próxima foto" className="absolute right-3 z-10 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/25"><ChevronRight size={28} /></button>}
      </div>
      {n > 1 && (
        <div className="flex items-center justify-center gap-2 p-5">
          {photos.map((_, a) => (
            <button key={a} onClick={() => setIndex(() => a)} aria-label={`Ir para foto ${a + 1}`} className={`h-2 rounded-full transition-all ${a === index ? "w-7 bg-white" : "w-2 bg-white/40 hover:bg-white/70"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductSheet({ product: p, onClose }: { product: Product; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const [size, setSize] = useState<string | null>(p.sizes ? (p.sizes.includes("M") ? "M" : (p.sizes[0] ?? null)) : null);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(false);
  const sizeLabel = p.sizes ? size ?? "a combinar" : "Tamanho único";
  const msg = `Olá, Clube Pet! Quero fazer um pedido:\n\nProduto: ${p.name}\nTamanho: ${sizeLabel}\nQuantidade: ${qty}\nTotal: ${brl(p.price * qty)}\n\nObrigado!`;
  const href = `${WA}?text=${encodeURIComponent(msg)}`;
  return (
    <Dialog.Root open onOpenChange={(o) => { if (!o && !zoom) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/55 data-[state=open]:animate-[fade-in_0.2s_ease-out]" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white text-[var(--ink)] outline-none data-[state=open]:animate-[sheet-in_0.25s_ease-out] sm:inset-0 sm:m-auto sm:h-fit sm:max-h-[88dvh] sm:rounded-3xl">
          <Dialog.Description className="sr-only">Detalhes do produto, escolha de tamanho e quantidade, e pedido pelo WhatsApp.</Dialog.Description>
          <div className="relative">
            <button onClick={() => setZoom(true)} aria-label="Ampliar foto do produto" className="block w-full cursor-zoom-in">
              <div className="aspect-square w-full bg-[var(--mint-soft)]"><Img src={p.photos[idx] ?? ""} alt={p.name} className="h-full w-full object-cover" /></div>
            </button>
            <button onClick={onClose} aria-label="Fechar detalhes" className="absolute right-3 top-3 rounded-full bg-black/55 p-2 text-white hover:bg-black/75"><X size={20} /></button>
            {p.photos.length > 1 && <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-bold text-white">Toque na foto para ampliar</span>}
          </div>
          {p.photos.length > 1 && (
            <div className="flex gap-2 px-4 pt-3">
              {p.photos.map((ph, r) => (
                <button key={ph} onClick={() => setIdx(r)} aria-label={`Ver foto ${r + 1} de ${p.name}`} aria-pressed={r === idx} className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition-all ${r === idx ? "border-[var(--ink)]" : "border-transparent opacity-60 hover:opacity-100"}`}>
                  <Img src={ph} alt={`${p.name} — foto ${r + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="px-4 pb-6 pt-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--mint-deep)]">{catOf(p).name}</p>
            <Dialog.Title className="font-display mt-1 text-[22px] font-extrabold leading-tight">{p.name}</Dialog.Title>
            <p className="font-display mt-1.5 text-[26px] font-extrabold">{brl(p.price)}</p>
            <div className="mt-5">
              <p className="text-sm font-bold">Tamanho</p>
              {p.sizes ? (
                <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Escolha o tamanho">
                  {p.sizes.map((k) => (
                    <button key={k} role="radio" aria-checked={size === k} onClick={() => setSize(k)} className={`min-w-[3.25rem] rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors ${size === k ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--mint-deep)]"}`}>{k}</button>
                  ))}
                </div>
              ) : (
                <p className="mt-2 inline-block rounded-full bg-[var(--mint-soft)] px-4 py-2 text-sm font-bold">Tamanho único</p>
              )}
            </div>
            <div className="mt-5 flex items-center justify-between">
              <p className="text-sm font-bold">Quantidade</p>
              <div className="flex items-center gap-4">
                <button onClick={() => setQty((k) => Math.max(1, k - 1))} aria-label="Diminuir quantidade" className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--line)] hover:border-[var(--mint-deep)] active:scale-95"><Minus size={16} /></button>
                <span className="w-6 text-center text-lg font-extrabold" aria-live="polite">{qty}</span>
                <button onClick={() => setQty((k) => Math.min(99, k + 1))} aria-label="Aumentar quantidade" className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--line)] hover:border-[var(--mint-deep)] active:scale-95"><Plus size={16} /></button>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--mint-faint)] p-4">
              <span className="text-sm font-semibold text-[var(--ink-soft)]">Total</span>
              <span className="font-display text-2xl font-extrabold" aria-live="polite">{brl(p.price * qty)}</span>
            </div>
            <a href={href} target="_blank" rel="noopener" className={`mt-3 ${waBtn}`}><MessageCircle size={20} />Pedir pelo WhatsApp</a>
            <p className="mt-2.5 text-center text-xs text-[var(--ink-soft)]">Pagamento e entrega combinados pelo WhatsApp.</p>
          </div>
          {zoom && <Lightbox photos={p.photos} name={p.name} index={idx} setIndex={(f) => setIdx(f)} onClose={() => setZoom(false)} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

type Tab = "home" | "products" | "club" | "whats";

function Home({ goTab, onCategory, onSelect }: { goTab: (t: Tab) => void; onCategory: (c: string) => void; onSelect: (p: Product) => void }) {
  const PRODUCTS = useContext(ProductsCtx);
  const featured = PRODUCTS.filter((p) => p.featured);
  return (
    <div>
      <section className="px-4 pt-5">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--mint-soft)] via-[#e3f1e8] to-[var(--mint)] p-6 sm:p-8">
          <PawPrint className="animate-floaty absolute -right-5 -top-5 h-32 w-32 rotate-12 text-white/60" strokeWidth={1.25} />
          <PawPrint className="absolute bottom-8 right-28 h-10 w-10 -rotate-12 text-white/50" strokeWidth={1.5} />
          <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Clube Pet</p>
          <h1 className="font-display mt-2 max-w-[17rem] text-[30px] font-extrabold leading-[1.15]">Estilo e conforto para o seu melhor amigo</h1>
          <p className="mt-2 max-w-[15rem] text-sm leading-relaxed text-[var(--ink-soft)]">Roupinhas, acessórios e brinquedos escolhidos com carinho.</p>
          <div className="relative z-10 mt-5 flex flex-wrap gap-2">
            <button onClick={() => goTab("products")} className="rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-bold text-white active:scale-95">Ver produtos</button>
            <button onClick={() => goTab("club")} className="rounded-full border-2 border-[var(--ink)] px-6 py-[10px] text-sm font-bold text-[var(--ink)] active:scale-95">Ser do clube</button>
          </div>
        </div>
      </section>
      <section className="px-4 pt-8">
        <h2 className="font-display text-xl font-extrabold">Categorias</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {CATS.map((c) => {
            const n = PRODUCTS.filter((p) => p.category === c.id).length;
            const Icon = c.icon;
            return (
              <button key={c.id} onClick={() => onCategory(c.id)} className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white text-left transition-transform duration-150 active:scale-[0.98]">
                <div className="aspect-[16/10] bg-[var(--mint-soft)]"><Img src={c.cover} alt={c.name} className="h-full w-full object-cover" /></div>
                <div className="flex items-center gap-2.5 p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--mint-soft)] text-[var(--ink)]"><Icon size={17} /></span>
                  <span>
                    <span className="font-display block text-[15px] font-bold leading-tight">{c.name}</span>
                    <span className="block text-xs text-[var(--ink-soft)]">{n} {n === 1 ? "modelo" : "modelos"} · {c.tagline}</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
      <section className="pt-8">
        <div className="flex items-center justify-between px-4">
          <h2 className="font-display flex items-center gap-2 text-xl font-extrabold"><Sparkles size={20} className="text-[var(--mint-deep)]" />Em Destaque</h2>
          <button onClick={() => goTab("products")} className="text-sm font-bold text-[var(--mint-deep)] underline-offset-4 hover:underline">Ver tudo</button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 px-4 lg:grid-cols-4">
          {featured.map((p) => <Card key={p.id} product={p} onSelect={() => onSelect(p)} />)}
        </div>
      </section>
      <section className="px-4 py-8">
        <div className="relative overflow-hidden rounded-3xl bg-[var(--ink)] p-6 text-center text-white sm:p-8">
          <PawPrint className="absolute -bottom-6 -left-6 h-28 w-28 -rotate-12 text-white/10" strokeWidth={1.25} />
          <PawPrint className="absolute -right-4 -top-4 h-20 w-20 rotate-12 text-white/10" strokeWidth={1.25} />
          <div className="relative">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--mint)] text-[var(--ink)]"><Users size={22} /></div>
            <h2 className="font-display mt-3 text-xl font-extrabold">Clube Pet no WhatsApp</h2>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-white/85">Entre pra nossa comunidade e receba novidades e promoções em primeira mão.</p>
            <a href={GROUP} target="_blank" rel="noopener" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--wa)] px-7 py-3.5 text-sm font-bold text-white active:scale-95"><MessageCircle size={18} />Entrar na comunidade</a>
          </div>
        </div>
      </section>
    </div>
  );
}

function Products({ category, setCategory, onSelect }: { category: string; setCategory: (c: string) => void; onSelect: (p: Product) => void }) {
  const PRODUCTS = useContext(ProductsCtx);
  const list = category === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === category);
  const chips = [{ id: "all", name: "Todos" }, ...CATS.map((c) => ({ id: c.id, name: c.name }))];
  return (
    <div className="px-4 pt-6">
      <h1 className="font-display text-[26px] font-extrabold">Produtos</h1>
      <p className="mt-0.5 text-sm text-[var(--ink-soft)]">{PRODUCTS.length} modelos · toque em um produto para ver detalhes</p>
      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {chips.map((c) => {
          const on = category === c.id;
          return <button key={c.id} onClick={() => setCategory(c.id)} aria-pressed={on} className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${on ? "bg-[var(--ink)] text-white" : "bg-[var(--mint-soft)] text-[var(--ink)] hover:bg-[var(--mint)]"}`}>{c.name}</button>;
        })}
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]" aria-live="polite">
        {category === "all" ? `Todos · ${list.length} modelos` : `${CATS.find((c) => c.id === category)?.name} · ${list.length} ${list.length === 1 ? "modelo" : "modelos"}`}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((p) => <Card key={p.id} product={p} onSelect={() => onSelect(p)} />)}
      </div>
      <div className="h-4" />
    </div>
  );
}

function Club() {
  return (
    <div className="px-4 pt-10">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--mint)] text-[var(--ink)]"><Users size={28} /></div>
        <h1 className="font-display mt-4 text-[32px] font-extrabold">Clube Pet</h1>
        <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-[var(--ink-soft)]">Entre pra nossa comunidade e receba novidades e promoções em primeira mão.</p>
        <ul className="mt-7 space-y-3 text-left">
          {["Novidades em primeira mão", "Promoções exclusivas para membros", "Uma comunidade apaixonada por pets"].map((t) => (
            <li key={t} className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--mint-faint)] p-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--mint)] text-[var(--ink)]"><Check size={17} strokeWidth={3} /></span>
              <span className="text-sm font-bold">{t}</span>
            </li>
          ))}
        </ul>
        <a href={GROUP} target="_blank" rel="noopener" className={`mt-7 ${waBtn}`}><MessageCircle size={20} />Entrar no grupo do WhatsApp</a>
        <p className="mt-3 text-xs text-[var(--ink-soft)]">Gratuito · saia quando quiser</p>
      </div>
      <div className="h-10" />
    </div>
  );
}

function Whats() {
  return (
    <div className="px-4 pt-10">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--wa)] text-white"><MessageCircle size={28} /></div>
        <h1 className="font-display mt-4 text-[32px] font-extrabold">Fale com a gente</h1>
        <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-[var(--ink-soft)]">Pedidos, dúvidas sobre tamanhos e novidades — atendimento direto pelo WhatsApp.</p>
        <a href={WA} target="_blank" rel="noopener" className={`mt-7 ${waBtn}`}><MessageCircle size={20} />Chamar no WhatsApp</a>
        <a href={GROUP} target="_blank" rel="noopener" className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border-2 border-[var(--ink)] py-[14px] text-sm font-bold text-[var(--ink)] active:scale-[0.99]"><Users size={18} />Entrar na comunidade</a>
        <p className="mt-4 text-xs leading-relaxed text-[var(--ink-soft)]">Prefere falar direto? É só tocar no botão verde e mandar sua mensagem.</p>
      </div>
      <div className="h-10" />
    </div>
  );
}

const TABS: { id: Tab; label: string; icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }> }[] = [
  { id: "home", label: "Início", icon: House },
  { id: "products", label: "Produtos", icon: ShoppingBag },
  { id: "club", label: "Clube", icon: Users },
  { id: "whats", label: "WhatsApp", icon: MessageCircle },
];
const HASH: Record<Tab, string> = { home: "inicio", products: "produtos", club: "clube", whats: "whatsapp" };

function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<Product | null>(null);
  const ready = useRef(false);
  const [products, setProducts] = useState<Product[]>(STATIC_PRODUCTS);

  useEffect(() => {
    supabase.from("products").select("*").order("sort_order").order("created_at").then(({ data }) => {
      if (data) setProducts(data.map((r) => ({ id: r.id, name: r.name, category: r.category, price: Number(r.price), sizes: r.sizes && r.sizes.length ? r.sizes : null, featured: r.featured, photos: r.photos })));
    });
  }, []);

  useEffect(() => {
    const h = window.location.hash.replace("#", "");
    const t = (Object.keys(HASH) as Tab[]).find((k) => HASH[k] === h);
    if (t) setTab(t);
  }, []);
  useEffect(() => {
    if (!ready.current) { ready.current = true; return; }
    window.scrollTo({ top: 0, behavior: "auto" });
    window.history.replaceState(null, "", `#${HASH[tab]}`);
  }, [tab]);

  return (
    <ProductsCtx.Provider value={products}>
    <div className="min-h-dvh overflow-x-clip bg-[var(--bg)] text-[var(--ink)]">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-2.5 pt-3">
          <img src={logo} alt="Clube Pet" className="h-auto w-[100px]" draggable={false} />
          <p className="font-display mt-1 text-[15px] font-semibold italic tracking-wide text-[var(--ink-soft)]">um clube feito pra eles</p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl pb-32">
        <div className={tab === "home" ? "" : "hidden"}><Home goTab={setTab} onCategory={(c) => { setCategory(c); setTab("products"); }} onSelect={setSelected} /></div>
        <div className={tab === "products" ? "" : "hidden"}><Products category={category} setCategory={setCategory} onSelect={setSelected} /></div>
        <div className={tab === "club" ? "" : "hidden"}><Club /></div>
        <div className={tab === "whats" ? "" : "hidden"}><Whats /></div>
        <footer className="mt-2 flex flex-col items-center gap-1.5 px-4 text-center">
          <PawPrint size={18} className="text-[var(--mint-deep)]" />
          <p className="text-xs font-semibold text-[var(--ink-soft)]">Clube Pet · um clube feito pra eles</p>
        </footer>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-white/95 backdrop-blur" style={{ paddingBottom: "env(safe-area-inset-bottom)" }} aria-label="Navegação principal">
        <div className="mx-auto grid max-w-lg grid-cols-4">
          {TABS.map((t) => {
            const on = tab === t.id;
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} aria-current={on ? "page" : undefined} className="flex flex-col items-center gap-1 px-2 pb-2 pt-2.5">
                <span className={`flex h-8 w-16 items-center justify-center rounded-full transition-colors ${on ? "bg-[var(--mint-soft)]" : ""}`}>
                  <Icon size={22} strokeWidth={on ? 2.5 : 2} className={on ? "text-[var(--ink)]" : "text-gray-400"} />
                </span>
                <span className={`text-[11px] font-bold ${on ? "text-[var(--ink)]" : "text-gray-400"}`}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      {selected && <ProductSheet key={selected.id} product={selected} onClose={() => setSelected(null)} />}
    </div>
    </ProductsCtx.Provider>
  );
}
