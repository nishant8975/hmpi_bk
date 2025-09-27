import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  BookOpen, 
  Mail, 
  Phone,
  FileText,
  Calculator,
  Upload,
  BarChart3,
  Users,
  ExternalLink
} from "lucide-react";

const Help = () => {
  const faqs = [
    {
      question: "What is the Heavy Metal Pollution Index (HMPI)?",
      answer: "HMPI is a comprehensive assessment tool that evaluates the degree of heavy metal contamination in groundwater. It considers multiple heavy metals simultaneously and provides a single numerical value indicating the overall pollution level, making it easier to assess water quality and potential health risks."
    },
    {
      question: "How is HMPI calculated?",
      answer: "HMPI is calculated using the formula: HMPI = Σ(Wi × Qi), where Wi is the weightage factor for each metal and Qi is the quality rating. The quality rating is determined by comparing measured concentrations with WHO standards. Values ≤100 indicate safe water, 101-200 moderate pollution, 201-300 high pollution, and >300 critical pollution levels."
    },
    {
      question: "What data format should I use for uploads?",
      answer: "Upload CSV or Excel files with columns: Location, Latitude, Longitude, and concentrations for As, Cd, Cr, Cu, Fe, Mn, Ni, Pb, Zn. Include units (mg/L or μg/L) and sampling dates. Use our sample template to ensure proper formatting."
    },
    {
      question: "How long does analysis take?",
      answer: "Processing time depends on dataset size: small datasets (<100 samples) take ~30 seconds, medium datasets (100-1000 samples) take ~2 minutes, and large datasets (>1000 samples) take 5-10 minutes. You'll receive email notifications when results are ready."
    },
    {
      question: "Can I export my results?",
      answer: "Yes, results can be exported in multiple formats including PDF reports, Excel spreadsheets, and CSV data files. Charts and maps can also be exported as high-resolution images for presentations and publications."
    },
    {
      question: "What are the WHO standards used?",
      answer: "We use WHO Guidelines for Drinking Water Quality (2022) standards: As (10 μg/L), Cd (3 μg/L), Cr (50 μg/L), Cu (2000 μg/L), Fe (300 μg/L), Mn (400 μg/L), Ni (70 μg/L), Pb (10 μg/L), Zn (3000 μg/L). National standards can also be configured in admin settings."
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
        <p className="text-muted-foreground">Get help with HMPI analysis, methodology, and technical support</p>
      </div>

      {/* Quick Help Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card hover:shadow-elegant transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-base">Upload Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Learn how to prepare and upload your water quality datasets
            </p>
            <Button variant="outline" size="sm" className="w-full">
              View Guide
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-2">
              <Calculator className="w-5 h-5 text-accent" />
            </div>
            <CardTitle className="text-base">HMPI Methodology</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Understand the scientific basis and calculation methods
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Learn More
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="w-10 h-10 bg-chart-3/10 rounded-lg flex items-center justify-center mb-2">
              <BarChart3 className="w-5 h-5 text-chart-3" />
            </div>
            <CardTitle className="text-base">Results Interpretation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              How to read and interpret your HMPI analysis results
            </p>
            <Button variant="outline" size="sm" className="w-full">
              View Tutorial
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="w-10 h-10 bg-chart-4/10 rounded-lg flex items-center justify-center mb-2">
              <FileText className="w-5 h-5 text-chart-4" />
            </div>
            <CardTitle className="text-base">API Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Integrate HMPI analysis into your own applications
            </p>
            <Button variant="outline" size="sm" className="w-full">
              API Docs
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FAQ Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Find answers to common questions about HMPI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Methodology */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                HMPI Methodology
              </CardTitle>
              <CardDescription>
                Scientific background and calculation methodology
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold mb-2">Heavy Metals Analyzed</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Arsenic (As)', 'Cadmium (Cd)', 'Chromium (Cr)', 'Copper (Cu)', 'Iron (Fe)', 'Manganese (Mn)', 'Nickel (Ni)', 'Lead (Pb)', 'Zinc (Zn)'].map(metal => (
                      <Badge key={metal} variant="secondary" className="text-xs">
                        {metal}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold mb-2">Risk Categories</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Safe</span>
                      <Badge className="bg-risk-safe text-risk-safe-foreground">≤ 100</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Moderate Risk</span>
                      <Badge className="bg-risk-moderate text-risk-moderate-foreground">101-200</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">High Risk</span>
                      <Badge className="bg-risk-high text-risk-high-foreground">201-300</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Critical</span>
                      <Badge className="bg-risk-critical text-risk-critical-foreground">&gt; 300</Badge>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Full Methodology Paper
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact & Resources */}
        <div className="space-y-6">
          {/* Contact Form */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Contact Support
              </CardTitle>
              <CardDescription>
                Get personalized help from our technical team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="your.email@domain.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input placeholder="How can we help you?" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea 
                  placeholder="Describe your question or issue in detail..."
                  className="min-h-[100px]"
                />
              </div>
              <Button className="w-full">
                Send Message
              </Button>
            </CardContent>
          </Card>

          {/* Quick Contact */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                Quick Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email Support</p>
                    <p className="text-xs text-muted-foreground">support@hmpi-analyzer.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone Support</p>
                    <p className="text-xs text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Community Forum</p>
                    <p className="text-xs text-muted-foreground">forum.hmpi-analyzer.com</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Support hours: Monday-Friday, 9 AM - 6 PM EST
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Additional Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" className="w-full justify-start text-sm">
                <FileText className="w-4 h-4 mr-2" />
                Sample Datasets
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm">
                <BookOpen className="w-4 h-4 mr-2" />
                User Manual (PDF)
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                WHO Guidelines
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Video Tutorials
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Help;