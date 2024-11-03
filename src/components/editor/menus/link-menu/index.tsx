import React, { useCallback, useState } from "react";
import { BubbleMenu as BaseBubbleMenu, useEditorState } from "@tiptap/react";

import { type MenuProps } from "../types";
import { LinkPreviewPanel } from "@/components/editor/panels/link-preview-panel";
import { LinkEditorPanel } from "@/components/editor/panels";

export const LinkMenu = ({ editor }: MenuProps): JSX.Element => {
  const [showEdit, setShowEdit] = useState(false);
  const { link, target } = useEditorState<{
    link: string | null;
    target: string | null;
  }>({
    editor,
    selector: (ctx) => {
      const attrs = ctx.editor.getAttributes("link") as {
        href?: string;
        target?: string;
      };
      return { link: attrs.href ?? null, target: attrs.target ?? null };
    },
  });

  const shouldShow = useCallback(() => {
    const isActive = editor.isActive("link");
    return isActive;
  }, [editor]);

  const handleEdit = useCallback(() => {
    setShowEdit(true);
  }, []);

  const onSetLink = useCallback(
    (url: string, openInNewTab?: boolean) => {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url, target: openInNewTab ? "_blank" : "" })
        .run();
      setShowEdit(false);
    },
    [editor],
  );

  const onUnsetLink = useCallback(() => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setShowEdit(false);
    return null;
  }, [editor]);

  return (
    <BaseBubbleMenu
      editor={editor}
      pluginKey="textMenu"
      shouldShow={shouldShow}
      updateDelay={0}
      tippyOptions={{
        popperOptions: {
          modifiers: [{ name: "flip", enabled: false }],
        },

        onHidden: () => {
          setShowEdit(false);
        },
      }}
    >
      {link &&
        (showEdit ? (
          <LinkEditorPanel
            initialUrl={link}
            initialOpenInNewTab={target === "_blank"}
            onSetLink={onSetLink}
          />
        ) : (
          <LinkPreviewPanel
            url={link}
            onClear={onUnsetLink}
            onEdit={handleEdit}
          />
        ))}
    </BaseBubbleMenu>
  );
};

export default LinkMenu;
