import Link from "next/link";
import * as jsxRuntime from "react/jsx-runtime";
import { compileMdx } from "nextra/compile";
import {
  Callout,
  Code,
  Details,
  Pre,
  Summary,
  Table,
  ImageZoom,
  withGitHubAlert,
  withIcons,
  Tabs,
  Steps,
  Cards,
  FileTree,
  Bleed,
} from "nextra/components";
import Mermaid from "@/components/mermaid";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

function resolveImagePath(src: string, slug: string): string {
  if (
    src &&
    !src.startsWith("http://") &&
    !src.startsWith("https://") &&
    !src.startsWith("/")
  ) {
    return `${basePath}/posts/${slug}/${src.replace(/^\.\//, "")}`;
  }
  return src;
}

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function rehypeImageFigures() {
  return (tree: HastNode) => {
    if (!tree.children) return;
    for (let i = 0; i < tree.children.length; i++) {
      const node = tree.children[i];
      if (node.type === "element" && node.tagName === "p" && node.children) {
        const imgElements = node.children.filter(
          (c) => c.type === "element" && c.tagName === "img",
        );
        const onlyImages =
          imgElements.length > 0 &&
          node.children.every(
            (c) =>
              (c.type === "element" && c.tagName === "img") ||
              (c.type === "text" && !c.value?.trim()),
          );

        if (onlyImages) {
          let nextElemIndex = -1;
          for (let j = i + 1; j < tree.children.length; j++) {
            const candidate = tree.children[j];
            if (candidate.type === "text" && !candidate.value?.trim()) continue;
            nextElemIndex = j;
            break;
          }

          let captionChildren: HastNode[] | null = null;
          if (nextElemIndex !== -1) {
            const nextNode = tree.children[nextElemIndex];
            if (
              nextNode.type === "element" &&
              nextNode.tagName === "p" &&
              nextNode.children?.length === 1 &&
              nextNode.children[0].type === "element" &&
              nextNode.children[0].tagName === "em"
            ) {
              captionChildren = nextNode.children[0].children || null;
              tree.children.splice(i + 1, nextElemIndex - i);
            }
          }

          if (!captionChildren && imgElements.length === 1) {
            const alt = imgElements[0].properties?.alt;
            if (
              typeof alt === "string" &&
              alt.trim() &&
              !/\.(png|jpe?g|webp|gif|svg)$/i.test(alt) &&
              !/^image[_\s-]?\d+$/i.test(alt)
            ) {
              captionChildren = [{ type: "text", value: alt.trim() }];
            }
          }

          node.tagName = "figure";
          if (captionChildren) {
            node.children.push({
              type: "element",
              tagName: "figcaption",
              properties: {},
              children: captionChildren,
            });
          }
        }
      }
    }
  };
}

const CALLOUT_TYPE: Record<string, "error" | "warning" | "info" | "default"> = {
  caution: "error",
  important: "error",
  note: "info",
  tip: "default",
  warning: "warning",
};

interface GitHubAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type: string;
}

const Blockquote = withGitHubAlert(({ type, ...props }: GitHubAlertProps) => (
  <Callout type={CALLOUT_TYPE[type] || "default"} {...props} />
));

function evaluateMdx(
  rawJs: string,
  components: Record<string, unknown> = {},
  scope: Record<string, unknown> = {},
) {
  const keys = Object.keys(scope);
  const values = Object.values(scope);
  const hydrateFn = Reflect.construct(Function, ["$", ...keys, rawJs]);
  return hydrateFn(
    {
      ...jsxRuntime,
      useMDXComponents: () => components,
    },
    ...values,
  );
}

interface MDXContentProps {
  content: string;
  slug: string;
}

export async function MDXContent({ content, slug }: MDXContentProps) {
  const compiled = await compileMdx(content, {
    defaultShowCopyCode: true,
    latex: true,
    mdxOptions: {
      format: "md",
      rehypePlugins: [rehypeImageFigures],
    },
  });

  const components = {
    blockquote: Blockquote,
    code: Code,
    details: Details,
    figure: (props: React.ComponentProps<"figure">) => (
      <figure
        className="my-8 flex flex-col items-center text-center max-w-full"
        {...props}
      />
    ),
    figcaption: (props: React.ComponentProps<"figcaption">) => (
      <figcaption
        className="mt-2.5 text-center text-xs text-muted leading-relaxed font-normal italic"
        {...props}
      />
    ),
    img: ({
      src,
      alt,
      width,
      height,
      ...props
    }: React.ComponentProps<"img">) => {
      if (!src) return null;
      const resolved = resolveImagePath(String(src), slug);
      const parsedWidth = typeof width === "number" ? width : undefined;
      const parsedHeight = typeof height === "number" ? height : undefined;
      return (
        <ImageZoom
          src={resolved}
          alt={alt || ""}
          width={parsedWidth}
          height={parsedHeight}
          className="rounded-xl w-full object-cover shadow-sm transition hover:opacity-95"
          {...props}
        />
      );
    },
    pre: withIcons(Pre),
    summary: Summary,
    table: Table,
    td: Table.Td,
    th: Table.Th,
    tr: Table.Tr,
    a: ({ href, children, ...props }: React.ComponentProps<"a">) => {
      if (!href) return <a {...props}>{children}</a>;
      if (href.startsWith("http://") || href.startsWith("https://")) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
            {...props}
          >
            {children}
          </a>
        );
      }
      return (
        <Link href={href} className="text-primary hover:underline" {...props}>
          {children}
        </Link>
      );
    },
    Callout,
    Tabs,
    Steps,
    Cards,
    FileTree,
    Bleed,
    Mermaid: ({ chart }: { chart: string }) => <Mermaid chart={chart} />,
  };

  const evaluated = evaluateMdx(compiled, components);
  const Component = evaluated.default;

  return <Component />;
}
