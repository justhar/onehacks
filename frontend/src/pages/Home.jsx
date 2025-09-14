import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="shadow-none">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-4xl font-bold text-gray-900">
              OneHacks
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Your platform for business and shopping needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => navigate("/login")}
              className="w-full"
              size="lg"
            >
              Login
            </Button>

            <Button
              onClick={() => navigate("/register")}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Register
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
