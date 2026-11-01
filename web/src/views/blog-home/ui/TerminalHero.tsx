"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import styles from "./TerminalHero.module.css";

export interface TerminalPost {
  no: number;
  issue: string;
  date: string;
  href: string;
  tag: string;
  title: string;
  tags: string[];
}

/** 분배 조건부 타입으로 각 블록에서 id 만 뺀다(그냥 Omit 하면 공용 필드만 남는다) */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

type Block =
  | { kind: "command"; id: number; text: string; typed: string }
  | { kind: "today"; id: number; post: TerminalPost }
  | { kind: "rows"; id: number; posts: TerminalPost[]; more?: number }
  | { kind: "note"; id: number; text: string };

/** 첫 화면에 보여 줄 최근 글 수 — 오늘 글은 바로 옆 큰 카드가 보여 주므로 터미널은 목록만 */
const RECENT_COUNT = 8;
const TYPE_DELAY_MS = { min: 28, jitter: 30 } as const;
const AFTER_TYPE_DELAY_MS = 120;
const COMMANDS = ["ls", "today", "random", "grep ", "open ", "clear", "help"];
const HELP_TEXT = "ls · today · random · grep <단어> · open <번호> · clear";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const shortDate = (isoDate: string) => isoDate.slice(5).replace("-", ".");
const matchesQuery = (post: TerminalPost, query: string) =>
  [post.title, ...post.tags].join(" ").toLowerCase().includes(query);

/**
 * 홈 첫 화면의 터미널. 들어오면 ls --recent 를 쳐서 최근 글을 보여 주고,
 * 입력창에서 명령(ls · grep · open …)으로 글을 찾는다. ↑↓ 로 글을 고르고 Enter 로 연다.
 * 움직임 줄이기 설정이면 타이핑 효과 없이 결과만 바로 보인다.
 */
export function TerminalHero({ posts }: { posts: TerminalPost[] }) {
  const router = useRouter();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState(-1);
  const outputRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const busy = useRef(false);
  const started = useRef(false);
  const latest = posts[0];

  const push = (block: DistributiveOmit<Block, "id">) => {
    const id = nextId.current++;
    setBlocks((previous) => [...previous, { ...block, id } as Block]);
    return id;
  };

  const typeCommand = async (text: string) => {
    const id = push({ kind: "command", text, typed: "" });
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setBlocks((previous) => previous.map((block) => (block.id === id ? { ...block, typed: text } : block)));
      return;
    }
    for (let length = 1; length <= text.length; length++) {
      await sleep(TYPE_DELAY_MS.min + Math.random() * TYPE_DELAY_MS.jitter);
      setBlocks((previous) => previous.map((block) => (block.id === id ? { ...block, typed: text.slice(0, length) } : block)));
    }
    await sleep(AFTER_TYPE_DELAY_MS);
  };

  const showRows = (found: TerminalPost[], more?: number) => {
    push({ kind: "rows", posts: found, more });
    setSelected(-1);
  };

  const execute = async (line: string) => {
    if (busy.current) return;
    busy.current = true;
    await typeCommand(line);
    const [name, ...args] = line.trim().split(/\s+/);
    const query = args.join(" ").toLowerCase();

    switch (name) {
      case "today":
        push({ kind: "today", post: latest });
        break;
      case "ls":
        if (args.includes("--recent")) showRows(posts.slice(0, RECENT_COUNT), posts.length - RECENT_COUNT);
        else showRows(posts);
        break;
      case "random":
        showRows([posts[Math.floor(Math.random() * posts.length)]]);
        break;
      case "grep": {
        const found = posts.filter((post) => matchesQuery(post, query));
        if (found.length > 0) showRows(found);
        else push({ kind: "note", text: `'${query}' 결과 없음` });
        break;
      }
      case "open": {
        const target = posts.find((post) => post.no === Number(args[0]));
        if (target) router.push(target.href);
        else push({ kind: "note", text: `no.${args[0] ?? ""} 없음` });
        break;
      }
      case "clear":
        setBlocks([]);
        setSelected(-1);
        break;
      case "help":
        push({ kind: "note", text: HELP_TEXT });
        break;
      default:
        push({ kind: "note", text: `${name}: 없는 명령 — help` });
    }
    busy.current = false;
  };

  useEffect(() => {
    // 개발 모드(StrictMode)에서 effect 가 두 번 불려도 한 번만 친다
    if (!latest || started.current) return;
    started.current = true;
    void execute("ls --recent");
    // 처음 한 번만 실행한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const output = outputRef.current;
    if (output) output.scrollTop = output.scrollHeight;
  }, [blocks]);

  const lastRows = [...blocks].reverse().find((block) => block.kind === "rows");
  const selectablePosts = lastRows?.kind === "rows" ? lastRows.posts : [];

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const hasSelection = selected >= 0 && !input;
      if (hasSelection) {
        router.push(selectablePosts[selected].href);
        return;
      }
      const line = input.trim();
      setInput("");
      if (line) void execute(line);
      return;
    }
    if (event.key === "Tab") {
      const completion = COMMANDS.find((command) => command.startsWith(input) && command !== input);
      if (completion) {
        event.preventDefault();
        setInput(completion);
      }
      return;
    }
    const isArrow = event.key === "ArrowDown" || event.key === "ArrowUp";
    if (isArrow && selectablePosts.length > 0) {
      event.preventDefault();
      const offset = event.key === "ArrowDown" ? 1 : -1;
      setSelected((current) => (current + offset + selectablePosts.length) % selectablePosts.length);
    }
  };

  return (
    <section className={styles.terminal} aria-label="글 찾기 터미널">
      <header className={styles.header}>
        <b>~/dev-digest</b>
        <span>매일 한 편, 프론트엔드를 깊게</span>
      </header>

      <div ref={outputRef} className={styles.output} role="log" aria-live="off">
        {blocks.map((block) => {
          switch (block.kind) {
            case "command":
              return (
                <p key={block.id} className={styles.command}>
                  <span className={styles.dollar}>$</span> {block.typed}
                </p>
              );
            case "today":
              return (
                <div key={block.id} className={styles.today}>
                  <p className={styles.meta}>
                    {block.post.issue} · {block.post.date.replaceAll("-", ".")} · {block.post.tags.join(" · ").toLowerCase()}
                  </p>
                  <Link href={block.post.href} className={styles.todayTitle}>
                    {block.post.title}
                  </Link>
                  <Link href={block.post.href} className={styles.read}>
                    → 읽기
                  </Link>
                </div>
              );
            case "rows":
              return (
                <div key={block.id} className={styles.rows}>
                  {block.posts.map((post, index) => (
                    <Link
                      key={post.href}
                      href={post.href}
                      className={styles.row}
                      data-selected={block === lastRows && index === selected}
                    >
                      <span className={styles.no}>{post.issue}</span>
                      <span className={styles.date}>{shortDate(post.date)}</span>
                      <span className={styles.tag}>{post.tag.toLowerCase()}</span>
                      <span className={styles.title}>{post.title}</span>
                    </Link>
                  ))}
                  {block.more !== undefined && block.more > 0 && <p className={styles.note}>… 외 {block.more}편 — ls</p>}
                </div>
              );
            case "note":
              return (
                <p key={block.id} className={styles.note}>
                  {block.text}
                </p>
              );
          }
        })}
      </div>

      <label className={styles.prompt}>
        <span className={styles.dollar} aria-hidden>
          $
        </span>
        <span className={styles.visuallyHidden}>명령 입력</span>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="ls · grep react · open 7 · random"
          autoComplete="off"
          spellCheck={false}
        />
        <kbd>tab</kbd>
        <kbd>↑↓</kbd>
      </label>
    </section>
  );
}
