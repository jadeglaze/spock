export const QRComponent = ({ url }: { url: string }) => {
  return (
    <div>
      <img src={url} alt="" title="" />
      <p>Scan with your phone!</p>
    </div>
  );
};
