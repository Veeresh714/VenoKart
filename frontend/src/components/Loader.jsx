import { DNA } from "react-loader-spinner";

const Loader = () => {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "70vh",
      }}
    >
      <DNA
        visible={true}
        height={120}
        width={120}
        ariaLabel="dna-loading"
      />
    </div>
  );
};

export default Loader;