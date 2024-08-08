export const WolframAlphaComponent = ({ text, input, result }: { text: string, input: string, result: string }) => {
    return (
      <div>
        <p>{text}</p>
        <p>Input: {input}</p>
        <p>Result: {result}</p>
        <p>(According to WolframAlpha)</p>
      </div>
    );
};
