import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, BarChart3, FlaskConical, Users, ShieldCheck, MapPin } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// Helper component for the 3D Globe
const Globe = () => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        mountRef.current.appendChild(renderer.domElement);

        const geometry = new THREE.SphereGeometry(2.5, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0x22c55e, wireframe: true });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        // Add some points to the globe
        const dotGeometry = new THREE.SphereGeometry(0.02, 16, 16);
        const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
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
            if (mountRef.current) {
                camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
            }
        };

        window.addEventListener('resize', handleResize);

        // Cleanup on unmount
        return () => {
            window.removeEventListener('resize', handleResize);
            mountRef.current?.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef} className="w-full h-full" />;
};

const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); // Check if a user is logged in

    // ✅ Auto redirect logged-in users
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    // ✅ Prevent landing content flash during redirect
    if (user) return null;

    return (
        <div className="bg-background text-foreground">
            {/* Hero Section */}
            <section className="relative h-screen w-full flex flex-col md:flex-row items-center justify-center text-center overflow-hidden">
                {/* Globe on the left */}
                <div className="w-full md:w-1/2 h-full">
                    <Globe />
                </div>

                {/* Text and Button on the right */}
                <div className="w-full md:w-1/2 relative z-10 p-4">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-white drop-shadow-lg">
                        Clarity for Our Planet's Water
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-green-200 mb-8 drop-shadow-md">
                        The HMPI-Analyzer translates complex groundwater data into actionable insights for researchers, policymakers, and the public.
                    </p>
                    <Button size="lg" onClick={() => scrollTo('how-it-works')} className="shadow-lg">
                        Discover the Data
                    </Button>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 px-4 bg-muted/30">
                <div className="container mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-4">Effortless Analysis. Powerful Results.</h2>
                    <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
                        Our automated platform simplifies the entire process of HMPI calculation, from raw data to visual insights.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="text-center">
                            <CardHeader>
                                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <Upload className="w-8 h-8 text-primary" />
                                </div>
                                <CardTitle>Upload Raw Data</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Securely upload your CSV datasets with heavy metal concentrations.</p>
                            </CardContent>
                        </Card>
                        <Card className="text-center">
                            <CardHeader>
                                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <FlaskConical className="w-8 h-8 text-primary" />
                                </div>
                                <CardTitle>Automate Calculations</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Our system instantly calculates the HMPI and classifies the risk level.</p>
                            </CardContent>
                        </Card>
                        <Card className="text-center">
                            <CardHeader>
                                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <BarChart3 className="w-8 h-8 text-primary" />
                                </div>
                                <CardTitle>Visualize Insights</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Explore results through interactive maps, charts, and dashboards.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Designed for Impact Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-4">Designed for Impact</h2>
                    <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
                        Tailored dashboards and tools for every stakeholder in water quality management.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6 rounded-lg">
                            <Users className="w-10 h-10 text-primary mb-4 mx-auto" />
                            <h3 className="text-xl font-semibold mb-2">For Researchers</h3>
                            <p className="text-muted-foreground">Turn data into discovery. Track historical trends, manage your analyses, and issue alerts on critical findings.</p>
                        </div>
                        <div className="p-6 rounded-lg">
                            <ShieldCheck className="w-10 h-10 text-primary mb-4 mx-auto" />
                            <h3 className="text-xl font-semibold mb-2">For Policymakers</h3>
                            <p className="text-muted-foreground">Make decisions with confidence. Get a high-level overview of regional water quality with live maps and instant alerts.</p>
                        </div>
                        <div className="p-6 rounded-lg">
                            <MapPin className="w-10 h-10 text-primary mb-4 mx-auto" />
                            <h3 className="text-xl font-semibold mb-2">For the Public</h3>
                            <p className="text-muted-foreground">Stay informed and get involved. Explore the contamination map, understand the risks, and report local environmental issues.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-20 px-4 bg-muted/30">
                <div className="container mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-4">Protecting Our Water Starts with Understanding It</h2>
                    <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Join the platform to contribute your research, or explore the live map to stay informed about your community.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {user ? (
                            <Button size="lg" onClick={() => navigate('/dashboard')}>Go to Your Dashboard</Button>
                        ) : (
                            <>
                                <Button size="lg" onClick={() => navigate('/dashboard')}>Explore the Live Map</Button>
                                <Button size="lg" variant="secondary" onClick={() => navigate('/login')}>Join the Platform</Button>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-6 border-t">
                <div className="container mx-auto text-center text-muted-foreground text-sm">
                    &copy; {new Date().getFullYear()} HMPI-Analyzer. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
