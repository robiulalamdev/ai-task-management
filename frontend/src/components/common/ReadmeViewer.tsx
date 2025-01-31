import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type IProps = {
  content: string;
};

const ReadmeViewer = ({
  content = "Here's the latest task name:\n\n- **First Task**\n\nLet me know if there's anything else you'd like to do!",
}: IProps) => {
  return (
    <div className="prose max-w-none dark:prose-invert p-4">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
};

export default ReadmeViewer;
