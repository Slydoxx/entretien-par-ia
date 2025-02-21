
import { useLocation, Navigate } from "react-router-dom";

const Questions = () => {
  const location = useLocation();
  const { job, description } = location.state || {};

  if (!description) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">
        Questions pour : {job}
      </h1>
      {/* Le contenu des questions sera implémenté plus tard */}
    </div>
  );
};

export default Questions;
