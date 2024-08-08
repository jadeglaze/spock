export const QRComponent = ({ text, url }: { text: string, url: string }) => {
  return (
    <div>
      <p>{text}</p>
      <img src={url} alt="" title="" />
      <p>Scan with your phone!</p>
    </div>
  );
};
