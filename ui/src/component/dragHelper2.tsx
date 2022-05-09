export const All = "all";

export const Move = "move";

export const Copy = "copy";

export const Link = "link";

export const CopyOrMove = "copyMove";

export const CopyOrLink = "copyLink";

export const LinkOrMove = "linkMove";

export const None = "none";

export default function DragHelper(props : {
  data : any
  dropEffect : any
  children : any
}) {
  const startDrag = (e : any) => {
    e.dataTransfer.setData("drag-item", props.data);
    e.dataTransfer.effectAllowed = props.dropEffect;
  }

  return (
    <div draggable onDragStart={startDrag} >
      {props.children}
    </div>
  );
}
