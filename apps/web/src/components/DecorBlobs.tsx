/** Manchas decorativas suaves de fondo, sin distraer del objetivo táctil. Usar dentro de un contenedor `position: relative`. */
export function DecorBlobs() {
  return (
    <>
      <div aria-hidden="true" style={BLOB_1} />
      <div aria-hidden="true" style={BLOB_2} />
    </>
  );
}

const BLOB_1: React.CSSProperties = {
  position: "absolute",
  top: "-10%",
  right: "-15%",
  width: "50vw",
  height: "50vw",
  borderRadius: "50%",
  background: "rgba(255,255,255,0.18)",
  pointerEvents: "none",
};

const BLOB_2: React.CSSProperties = {
  position: "absolute",
  bottom: "-15%",
  left: "-10%",
  width: "40vw",
  height: "40vw",
  borderRadius: "50%",
  background: "rgba(255,255,255,0.12)",
  pointerEvents: "none",
};
