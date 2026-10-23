export default function Vazio({ icone, texto }: { icone: string; texto: string }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icone}</div>
      <p>{texto}</p>
    </div>
  );
}