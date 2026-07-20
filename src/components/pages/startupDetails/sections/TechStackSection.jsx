import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code } from "lucide-react";
import { Badge } from '../../../ui/badge';
export default function TechStackSection({ startup }) {

  return (
    <motion.section
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-gray-800 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-400" />
            Technology Stack
          </CardTitle>
        </CardHeader>
        <CardContent>
          {startup?.tech_stack && startup.tech_stack.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {startup.tech_stack.map((tech, index) => (
                <motion.div
                  key={tech}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <Badge
                    variant="outline"
                    className="px-4 py-2 text-sm border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                  >
                    <Code className="w-4 h-4 mr-2" />
                    {tech}
                  </Badge>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">No technologies specified yet.</p>
          )}
        </CardContent>
      </Card>
    </motion.section>
  );
}