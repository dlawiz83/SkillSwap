import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    navigate("/AuthPage");
  };

 
  const stepVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.5* i * 0.6, duration: 1.2 },
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex flex-col items-center justify-center px-6 text-white">
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-5xl font-bold mb-4 select-none"
      >
        SkillSwap
      </motion.h1>
      <motion.p
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="text-lg max-w-xl text-center mb-10"
      >
        Exchange skills. Learn what you want by teaching what you know.
      </motion.p>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleGetStarted}
        className="bg-orange-500 hover:bg-orange-600 px-8 py-3 rounded-full text-lg font-semibold shadow-lg mb-12"
      >
        Get Started
      </motion.button>

     
      <div className="max-w-4xl w-full">
        <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            {
              title: "Offer a Skill",
              description:
                "Create a profile and list the skills you want to teach others.",
            },
            {
              title: "Find Matches",
              description:
                "Browse profiles of others who want to learn what you can teach.",
            },
            {
              title: "Start Swapping",
              description:
                "Connect with your matches and exchange knowledge seamlessly.",
            },
          ].map((step, i) => (
            <motion.div
              key={step.title}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={stepVariants}
              className="bg-white bg-opacity-20 rounded-lg p-6 shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p>{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
