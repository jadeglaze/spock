export const WolframAlphaComponent = ({ input, result }: { input: string, result: string }) => {
    return (
      <div>
        <p>Input: {input}</p>
        <p>Result: {result}</p>
        <p>(According to WolframAlpha)</p>
      </div>
    );
};
