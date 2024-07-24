import bootstrap from "@/index";

const { handleRequest } = bootstrap()

export { handleRequest as GET, handleRequest as POST, handleRequest as OPTIONS }