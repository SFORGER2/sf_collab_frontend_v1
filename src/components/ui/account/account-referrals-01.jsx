"use client";;
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Input } from "../../ui/input";
import { Progress } from "../../ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import {
  Gift,
  Copy,
  Share2,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  Mail,
  Twitter,
  Facebook,
} from "lucide-react";
import { useState } from "react";

export const title = "Account Referral Program";

export default function AccountReferrals01() {
  const referralCode = "EMMA2024";
  const referralLink = `https://app.example.com/ref/${referralCode}`;

  const totalReferrals = 12;
  const activeReferrals = 8;
  const pendingReferrals = 4;
  const totalEarnings = 180;
  const pendingEarnings = 40;

  const nextMilestone = 15;
  const progressToMilestone = (activeReferrals / nextMilestone) * 100;

  const [referrals] = useState([
    {
      id: "1",
      name: "John Smith",
      email: "john@example.com",
      status: "converted",
      reward: 20,
      joinedAt: "2 weeks ago",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      status: "active",
      reward: 15,
      joinedAt: "1 month ago",
    },
    {
      id: "3",
      name: "Mike Chen",
      email: "mike@example.com",
      status: "pending",
      reward: 10,
      joinedAt: "3 days ago",
    },
    {
      id: "4",
      name: "Lisa Brown",
      email: "lisa@example.com",
      status: "active",
      reward: 15,
      joinedAt: "2 months ago",
    },
  ]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    console.log("Copied referral link");
  };

  const handleShare = (platform) => {
    console.log("Sharing to:", platform);
    const message = encodeURIComponent(`Join me on App! Use my referral link: ${referralLink}`);

    switch (platform) {
      case "email":
        window.location.href = `mailto:?subject=Join me on App&body=${message}`;
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${message}`, "_blank");
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
          "_blank"
        );
        break;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "converted":
        return (
          <Badge variant="outline" className="border-green-200 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />Converted
                      </Badge>
        );
      case "active":
        return (
          <Badge variant="outline" className="border-blue-200 text-blue-700">
            <Users className="h-3 w-3 mr-1" />Active
                      </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="border-orange-200 text-orange-700">
            <Clock className="h-3 w-3 mr-1" />Pending
                      </Badge>
        );
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 dark:bg-blue-950 p-3">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold">{totalReferrals}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-card border p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 dark:bg-green-950 p-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{activeReferrals}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-card border p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 dark:bg-purple-950 p-3">
                <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold">${totalEarnings}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-card border p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-orange-100 dark:bg-orange-950 p-3">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">${pendingEarnings}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Referral Link */}
        <Card className="bg-card border p-8">
          <div className="flex flex-col gap-6">
            <div>
              <h2
                className="text-2xl font-semibold tracking-tight flex items-center gap-2 mb-2">
                <Gift className="h-6 w-6" />
                Your Referral Link
              </h2>
              <p className="text-muted-foreground text-sm">
                Share your unique link to earn rewards when friends join
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Input value={referralLink} readOnly className="flex-1 font-mono text-sm" />
              <Button onClick={handleCopyLink} className="w-full sm:w-auto">
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
            </div>

            <div>
              <p className="text-sm font-medium mb-3">Share via:</p>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => handleShare("email")}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleShare("twitter")}>
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleShare("facebook")}>
                  <Facebook className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  More
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Milestone Progress */}
        <Card className="bg-card border p-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Next Milestone
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Refer {nextMilestone} friends to unlock a $50 bonus
                </p>
              </div>
              <Badge variant="secondary">{activeReferrals} / {nextMilestone}</Badge>
            </div>
            <Progress value={progressToMilestone} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {nextMilestone - activeReferrals} more referrals to reach your next milestone
            </p>
          </div>
        </Card>

        {/* Referrals Table */}
        <Card className="bg-card border p-8">
          <div className="border-b pb-4 mb-6">
            <h3 className="text-sm font-medium">Your Referrals</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Track the status of your referrals and rewards
            </p>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Reward</TableHead>
                  <TableHead className="font-semibold text-right">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell className="font-medium">{referral.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {referral.email}
                    </TableCell>
                    <TableCell>{getStatusBadge(referral.status)}</TableCell>
                    <TableCell>
                      <span className="font-semibold">${referral.reward}</span>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {referral.joinedAt}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* How It Works */}
        <Card className="bg-card border p-8">
          <h3 className="text-sm font-medium mb-4">How It Works</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div
                className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center">
                <span className="text-primary font-bold">1</span>
              </div>
              <h4 className="font-medium">Share Your Link</h4>
              <p className="text-sm text-muted-foreground">
                Send your unique referral link to friends and colleagues
              </p>
            </div>
            <div className="space-y-2">
              <div
                className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center">
                <span className="text-primary font-bold">2</span>
              </div>
              <h4 className="font-medium">They Sign Up</h4>
              <p className="text-sm text-muted-foreground">
                Your friend creates an account using your referral link
              </p>
            </div>
            <div className="space-y-2">
              <div
                className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center">
                <span className="text-primary font-bold">3</span>
              </div>
              <h4 className="font-medium">You Both Get Rewarded</h4>
              <p className="text-sm text-muted-foreground">
                Earn $15 credit when they complete their first purchase
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
