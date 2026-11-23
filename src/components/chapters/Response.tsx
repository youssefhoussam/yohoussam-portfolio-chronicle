import { motion } from "framer-motion";
import { Check, Copy, Github, Linkedin, Mail, MapPin, Phone, Send } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CHAPTER_MAP } from "@/data/chapters";
import { profile } from "@/data/portfolio";
import { actions, useApp } from "@/lib/app";
import { copyText } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type Status = { code: 0 } | { code: 202 } | { code: 400; field: string };

function ContactRow({ icon, label, children, action }: { icon: ReactNode; label: string; children: ReactNode; action?: ReactNode }) {
  return (
    <li className="flex items-center gap-4 border-b border-white/[0.06] py-3.5 last:border-0">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-paper/80">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">{label}</span>
        <span className="block truncate text-[15px] text-paper">{children}</span>
      </span>
      {action}
    </li>
  );
}

function JsonField({
  name,
  value,
  onChange,
  placeholder,
  multiline,
  invalid,
  last,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
  invalid?: boolean;
  last?: boolean;
}) {
  const id = `composer-${name}`;
  const shared = cn(
    "w-full resize-none rounded-md bg-white/[0.03] px-2 py-1 font-mono text-[16px] text-amber-100 outline-none ring-1 transition placeholder:text-white/20 focus:bg-white/[0.06] sm:text-[13px]",
    invalid ? "ring-rose-400/70" : "ring-white/[0.06] focus:ring-spring/50",
  );
  return (
    <div className="flex gap-2 pl-5">
      <label htmlFor={id} className="shrink-0 pt-1 text-neural">
        &quot;{name}&quot;:
      </label>
      <div className="min-w-0 flex-1">
        {multiline ? (
          <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} className={shared} />
        ) : (
          <input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={shared} autoComplete="off" />
        )}
      </div>
      {!last && <span className="pt-1 text-white/40">,</span>}
    </div>
  );
}

export function Response() {
  const prefill = useApp((s) => s.composerPrefill);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>({ code: 0 });
  const [copied, setCopied] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!prefill) return;
    setMessage(prefill);
    actions.prefillComposer("");
  }, [prefill]);

  const send = () => {
    if (!message.trim()) return setStatus({ code: 400, field: "message" });
    if (!name.trim()) return setStatus({ code: 400, field: "name" });
    setStatus({ code: 202 });
    const subject = `Hello from ${name.trim()}${company.trim() ? ` (${company.trim()})` : ""}`;
    const body = `${message.trim()}\n\n— ${name.trim()}${company.trim() ? `, ${company.trim()}` : ""}`;
    window.setTimeout(() => {
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }, 450);
  };

  const copyEmail = async () => {
    if (await copyText(profile.email)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <section id="response" data-debug="<Response />" className="relative pb-20 pt-28 sm:pt-36">
      <div className="shell">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mb-12 max-w-3xl sm:mb-16"
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
            <span className="text-spring">{CHAPTER_MAP.response.index}</span>
            <span className="h-px w-8 bg-white/15" />
            <span>response</span>
          </div>
          <p className="mt-6 font-mono text-[clamp(1.1rem,2.6vw,1.6rem)] text-spring">HTTP/1.1 200 OK</p>
          <h2 className="mt-2 font-display text-[clamp(2.8rem,7vw,6rem)] leading-[0.92] tracking-[-0.02em] text-paper">
            Let&apos;s build something
            <br />
            <em className="text-tracks pr-2">that ships.</em>
          </h2>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-dim sm:text-lg">
            I&apos;m looking for a full-time role in an English-first team, and I&apos;m open to relocation and remote-friendly setups. The
            fastest way to reach me is email.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <motion.div
            data-solid
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="panel px-5 py-2"
          >
            <ul>
              <ContactRow
                icon={<Mail className="h-4 w-4" />}
                label="email"
                action={
                  <button onClick={copyEmail} className="btn-ghost h-9 px-3" aria-label="Copy the email address">
                    {copied ? <Check className="h-4 w-4 text-spring" /> : <Copy className="h-4 w-4" />}
                  </button>
                }
              >
                <a href={`mailto:${profile.email}`} className="hover:text-spring">
                  {profile.email}
                </a>
              </ContactRow>
              <ContactRow icon={<Phone className="h-4 w-4" />} label="phone">
                <a href={profile.phoneHref} className="hover:text-spring">
                  {profile.phone}
                </a>
              </ContactRow>
              <ContactRow icon={<Linkedin className="h-4 w-4" />} label="linkedin">
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-spring">
                  {profile.linkedinLabel}
                </a>
              </ContactRow>
              <ContactRow icon={<Github className="h-4 w-4" />} label="github">
                <a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-spring">
                  {profile.githubLabel}
                </a>
              </ContactRow>
              <ContactRow icon={<MapPin className="h-4 w-4" />} label="location">
                {profile.location} · open to relocation
              </ContactRow>
            </ul>
          </motion.div>

          <motion.form
            data-solid
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="panel overflow-hidden"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
            }}
            aria-label="Compose a message"
          >
            <div className="border-b border-white/[0.06] px-5 py-3 font-mono text-[11px] text-dim">compose a request</div>
            <div ref={messageRef} className="space-y-2 px-5 py-4 font-mono text-[13px] leading-relaxed">
              <p>
                <span className="text-spring">POST</span> <span className="text-paper">/youssef/messages</span>{" "}
                <span className="text-white/35">HTTP/1.1</span>
              </p>
              <p className="text-white/35">
                Host: youssefhoussam.github.io
                <br />
                Content-Type: application/json
              </p>
              <p className="pt-2 text-white/50">{"{"}</p>
              <JsonField name="name" value={name} onChange={setName} placeholder="your name" invalid={status.code === 400 && status.field === "name"} />
              <JsonField name="company" value={company} onChange={setCompany} placeholder="optional" />
              <JsonField
                name="message"
                value={message}
                onChange={setMessage}
                placeholder="Hi Youssef, we're hiring a backend / AI engineer…"
                multiline
                last
                invalid={status.code === 400 && status.field === "message"}
              />
              <p className="text-white/50">{"}"}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 border-t border-white/[0.06] px-5 py-3">
              <button type="submit" className="btn-primary">
                <Send className="h-4 w-4" /> Send request
              </button>
              <span className="font-mono text-[11px] text-white/30">⌘/Ctrl + Enter · opens your mail app</span>
              <span className="ml-auto font-mono text-[11px]" aria-live="polite">
                {status.code === 202 && <span className="text-spring">202 Accepted · opening your mail client…</span>}
                {status.code === 400 && <span className="text-rose-300">400 Bad Request · &quot;{status.field}&quot; is required</span>}
              </span>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
