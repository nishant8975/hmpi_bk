import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
    Upload, 
    BarChart3, 
    FlaskConical, 
    Users, 
    ShieldCheck, 
    MapPin, 
    TestTube, 
    BarChart,
    Wrench, // Added for the new section
    Waves,
    ArrowDown,
    Shield,
    Microscope,
    User,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// Data for the demo accounts
const demoAccounts = [
  {
    role: "Admin",
    email: "admin@hmpi.com",
    password: "password123",
    icon: <ShieldCheck className="h-6 w-6 text-red-500" />,
  },
  {
    role: "Researcher",
    email: "researcher@hmpi.com",
    password: "password123",
    icon: <TestTube className="h-6 w-6 text-blue-500" />,
  },
  {
    role: "Policymaker",
    email: "policymaker@hmpi.com",
    password: "password123",
    icon: <BarChart className="h-6 w-6 text-green-500" />,
  },
  {
    role: "Public User",
    email: "public@hmpi.com",
    password: "password123",
    icon: <Users className="h-6 w-6 text-yellow-500" />,
  },
];

//================================================================//
//  NAVIGATION BAR COMPONENT
//================================================================//
const Navbar = () => {
    const [isScrolled, setIsScrolled] = React.useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className={clsx(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled ? "bg-slate-900/80 backdrop-blur-lg border-b border-slate-700" : "bg-transparent"
            )}
        >
            <div className="container mx-auto flex justify-between items-center py-4 px-4">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <Waves className="text-blue-400" />
                    <span className="font-bold text-xl text-white">HMPI-Analyzer</span>
                </div>
                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
                    <a onClick={() => scrollTo('features')} className="cursor-pointer hover:text-blue-400 transition-colors">Features</a>
                    <a onClick={() => scrollTo('impact')} className="cursor-pointer hover:text-blue-400 transition-colors">For Who</a>
                    <a onClick={() => scrollTo('demo')} className="cursor-pointer hover:text-blue-400 transition-colors">Demo</a>
                </div>
                <div>
                    <Button onClick={() => navigate('/login')} variant="outline" size="sm" className="bg-transparent border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white transition-colors">
                        Join Platform
                    </Button>
                </div>
            </div>
        </motion.nav>
    );
};

//================================================================//
//  HERO SECTION & 3D GLOBE COMPONENT
//================================================================//
const Globe = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!mountRef.current) return;
        const mount = mountRef.current;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        renderer.setSize(mount.clientWidth, mount.clientHeight);
        mount.appendChild(renderer.domElement);

        const geometry = new THREE.SphereGeometry(2.5, 40, 40);
        const material = new THREE.MeshBasicMaterial({ color: 0x0077ff, wireframe: true, transparent: true, opacity: 0.4 });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        const dotGeometry = new THREE.SphereGeometry(0.02, 16, 16);
        const dotMaterial = new THREE.MeshBasicMaterial({ color: 0x89cff0 });
        for (let i = 0; i < 300; i++) {
            const dot = new THREE.Mesh(dotGeometry, dotMaterial);
            const [lat, lon] = [Math.random() * 180 - 90, Math.random() * 360 - 180];
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (lon + 180) * (Math.PI / 180);

            dot.position.x = -2.5 * Math.sin(phi) * Math.cos(theta);
            dot.position.y = 2.5 * Math.cos(phi);
            dot.position.z = 2.5 * Math.sin(phi) * Math.sin(theta);
            sphere.add(dot);
        }

        camera.position.z = 5;

        const animate = () => {
            requestAnimationFrame(animate);
            sphere.rotation.y += 0.001;
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            camera.aspect = mount.clientWidth / mount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mount.clientWidth, mount.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            mount.removeChild(renderer.domElement);
        };
    }, []);
    return <div ref={mountRef} className="absolute inset-0 z-0" />;
};

const Hero = () => {
    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="relative h-screen w-full flex flex-col items-center justify-center text-center overflow-hidden">
            <Globe />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 p-4"
            >
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 text-white drop-shadow-lg">
                    Clarity for Our Planet's Water
                </h1>
                <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-300 mb-8 drop-shadow-md">
                    The HMPI-Analyzer translates complex groundwater data into actionable insights for researchers, policymakers, and the public.
                </p>
                <div className="flex justify-center gap-4">
                     <Button size="lg" onClick={() => scrollTo('features')} className="shadow-lg bg-blue-500 hover:bg-blue-600 text-white">
                        Discover More <ArrowDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </motion.div>
        </section>
    );
};

// ✨ NEW: Work In Progress Section
const WorkInProgressSection = () => (
    <section className="py-12 bg-yellow-900/20 px-4">
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="container mx-auto text-center flex flex-col md:flex-row items-center justify-center gap-4 text-yellow-300"
        >
            <Wrench className="h-8 w-8 md:h-6 md:w-6 flex-shrink-0"/>
            <div>
                <h3 className="font-bold">This Project is Under Active Development</h3>
                <p className="text-sm text-yellow-400">You are viewing a live demo. Features and data are for demonstration purposes and are continuously being updated.</p>
            </div>
        </motion.div>
    </section>
);


//================================================================//
//  FEATURE SECTION COMPONENT
//================================================================//
const featureVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
};

const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <motion.div variants={featureVariants}>
        <Card className="text-center bg-slate-800/50 border border-slate-700 h-full hover:border-blue-400 hover:bg-slate-800 transition-all group">
            <CardHeader className="items-center">
                <div className="p-4 bg-slate-700/50 rounded-full group-hover:bg-blue-500/20 transition-colors">
                    {icon}
                </div>
                <CardTitle className="text-white pt-4">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-gray-400">{children}</p>
            </CardContent>
        </Card>
    </motion.div>
);

const FeatureSection = () => {
    return (
        <section id="features" className="py-24 px-4 bg-black/20">
            <div className="container mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-4xl font-bold mb-4 text-white">Effortless Analysis. Powerful Results.</h2>
                    <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
                        Our automated platform simplifies the entire process of HMPI calculation, from raw data to visual insights.
                    </p>
                </motion.div>
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ staggerChildren: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    <FeatureCard icon={<Upload className="w-8 h-8 text-blue-400" />} title="Upload Raw Data">
                        Securely upload your CSV datasets with heavy metal concentrations.
                    </FeatureCard>
                    <FeatureCard icon={<FlaskConical className="w-8 h-8 text-blue-400" />} title="Automate Calculations">
                        Our system instantly calculates the HMPI and classifies the risk level.
                    </FeatureCard>
                    <FeatureCard icon={<BarChart3 className="w-8 h-8 text-blue-400" />} title="Visualize Insights">
                        Explore results through interactive maps, charts, and dashboards.
                    </FeatureCard>
                </motion.div>
            </div>
        </section>
    );
};


//================================================================//
//  IMPACT SECTION COMPONENT
//================================================================//
const RoleCard = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <motion.div 
        className="p-8 rounded-xl bg-slate-900/40 border border-slate-800"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
    >
        {icon}
        <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
        <p className="text-gray-400">{children}</p>
    </motion.div>
);

const ImpactSection = () => {
    return (
        <section id="impact" className="py-24 px-4">
            <div className="container mx-auto text-center">
                <h2 className="text-4xl font-bold mb-4 text-white">Designed for Impact</h2>
                <p className="text-gray-400 mb-16 max-w-2xl mx-auto">
                    Tailored dashboards and tools for every stakeholder in water quality management.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    <RoleCard icon={<Users className="w-10 h-10 text-blue-400 mb-4" />} title="For Researchers">
                        Turn data into discovery. Track historical trends, manage your analyses, and issue alerts on critical findings.
                    </RoleCard>
                    <RoleCard icon={<ShieldCheck className="w-10 h-10 text-blue-400 mb-4" />} title="For Policymakers">
                        Make decisions with confidence. Get a high-level overview of regional water quality with live maps and instant alerts.
                    </RoleCard>
                    <RoleCard icon={<MapPin className="w-10 h-10 text-blue-400 mb-4" />} title="For the Public">
                        Stay informed and get involved. Explore the contamination map, understand the risks, and report local environmental issues.
                    </RoleCard>
                </div>
            </div>
        </section>
    );
};


//================================================================//
//  DEMO CREDENTIALS SECTION COMPONENT
//================================================================//
const credentials = [
    { role: 'Admin', email: 'dawarekshitija@gmail.com', icon: <Shield className="h-5 w-5 text-red-400" /> },
    { role: 'Researcher', email: 'nishantpawade77@gmail.com', icon: <Microscope className="h-5 w-5 text-blue-400" /> },
    { role: 'Policymaker', email: 'aryansatpute97@gmail.com', icon: <BarChart className="h-5 w-5 text-green-400" /> },
    { role: 'Public User', email: 'adityarajsingh1006@gmail.com', icon: <User className="h-5 w-5 text-yellow-400" /> },
];

const DemoCredentialsSection = () => {
    return (
        <section id="demo" className="py-24 px-4">
            <div className="container mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl font-bold mb-4 text-white">Explore the Platform</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Use these demo credentials to log in and experience the features available for each role. The password for all accounts is <span className="font-mono text-teal-400">123456</span>.
                    </p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="max-w-4xl mx-auto bg-slate-800/50 border border-slate-700 rounded-lg backdrop-blur-sm p-8"
                >
                    <div className="divide-y divide-slate-700">
                        {credentials.map((cred, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 items-center py-4">
                                <div className="flex items-center gap-3 mb-2 md:mb-0">
                                    {cred.icon}
                                    <span className="font-semibold text-white">{cred.role}</span>
                                </div>
                                <span className="font-mono text-gray-400 text-sm">{cred.email}</span>
                                <span className="font-mono text-gray-400 text-sm md:text-right">123456</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};


//================================================================//
//  FINAL CALL TO ACTION & FOOTER COMPONENTS
//================================================================//
const FinalCTA = () => {
    const navigate = useNavigate();
    return (
        <section className="py-24 px-4">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="container mx-auto text-center"
            >
                <h2 className="text-4xl font-bold mb-4 text-white">Protecting Our Water Starts with Understanding It</h2>
                <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                    Join the platform to contribute your research, or explore the live map to stay informed about your community.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" onClick={() => navigate('/dashboard')} className="bg-blue-500 hover:bg-blue-600 text-white">Explore the Live Map</Button>
                    <Button size="lg" variant="secondary" onClick={() => navigate('/login')} className="bg-slate-700 hover:bg-slate-600 text-white">Join the Platform</Button>
                </div>
            </motion.div>
        </section>
    );
};

const Footer = () => {
    return (
        <footer className="py-6 border-t border-slate-800">
            <div className="container mx-auto text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} HMPI-Analyzer. All rights reserved.
            </div>
        </footer>
    );
};


//================================================================//
//  MAIN LANDING PAGE COMPONENT (EXPORT DEFAULT)
//================================================================//
const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Redirect logged-in users to the dashboard
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    // Prevents the landing page from flashing for logged-in users during the redirect
    if (user) {
        return null;
    }

    return (
        <div className="bg-[#0D1117] text-gray-200 antialiased">
            {/* Background Gradient Aurora Effect */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-30%] left-[-20%] w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-[-30%] right-[-20%] w-[700px] h-[700px] bg-teal-500/20 rounded-full blur-[150px]"></div>
            </div>
            
            <Navbar />
            <main className="overflow-x-hidden">
                <Hero />
                <WorkInProgressSection />
                <FeatureSection />
                <ImpactSection />
                <DemoCredentialsSection />
                <FinalCTA />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;

