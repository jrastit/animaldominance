export default function DropHelper(props: {
  onDrop: any
  children: any
}) {
  function dragOver(e: any) {
    e.preventDefault();
  }


  function drop(e: any) {
    const droppedItem = e.dataTransfer.getData("drag-item");
    if (droppedItem) {
      props.onDrop(droppedItem);
    }

  }

  return (
    <div onDragOver={dragOver} onDrop={drop} >
      {props.children}
    </div>
  );
}
