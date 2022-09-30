const raiseError = () => {
  throw new Error("Test Error");
};

const handler = async () => {
  raiseError();
};

export default handler;
