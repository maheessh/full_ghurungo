import { Route, Routes as Switch, Navigate } from "react-router-dom";
import { NotFoundPage } from "../pages/not-found";
import { useUser } from "../authentication/use-auth";
import { PageWrapper } from "../components/page-wrapper/page-wrapper";
import { routes } from ".";
import Events from "../pages/events-page/events";
import { UserSignUp } from "../pages/user-page/user-singup";
import { LoginPage } from "../pages/login-page/login-page";
import Dashboard from "../pages/user-page/dashboard";
import EventParticipants from "../pages/events-page/event-participants";
import OrganizationListing from "../pages/organization-page/organization";
import OrganizationUpdate from "../pages/organization-page/organization-update";
import OrganizationCreate from "../pages/organization-page/organization-create";
import Reviews from "../pages/review-page/review";
import ChatRooms from "../pages/chatroom-page/chatrooms";
import ChatRoomDetail from "../pages/chatroom-page/chatroomdetail";
import OrgMain from "../pages/organization-member/org-member";
import ChatRoomsDashboard from "../pages/chatroom-page/chatroomdashboard";
import LandingPage from "../pages/landing-page/landing-page";
import MemberDashboard from "../pages/organization-member/memberdashboard";
import ReviewsPage from "../pages/review-page/review";
import ReviewsDashboard from "../pages/review-page/review-dashboard";
import Users from "../pages/user-page/user-page";
export const Routes = () => {
  const user = useUser();
  return (
    <>
      {/* The page wrapper is what shows the NavBar at the top, it is around all pages inside of here. */}
      <PageWrapper user={user}>
        <Switch>
          {/* When path === / render LandingPage */}
          <Route path={routes.home} element={<LandingPage />} />
          {/* When path === /iser render UserPage */}
          <Route path={routes.user} element={<Users />} />
          <Route path={routes.usersignup} element={<UserSignUp />} />
          <Route path={routes.login} element={<LoginPage fetchCurrentUser={function (): void {
            throw new Error("Function not implemented.");
          } } />} />

          <Route path={routes.events} element={<Events />} />
          <Route path={routes.eparticipants} element={<EventParticipants/>} />
          <Route path={routes.chatroom} element={<ChatRooms />} />
           {/* work on this later */}
          <Route path={routes.chatroomdetail} element={<ChatRoomDetail />} /> 
          <Route path={routes.dashboard} element={<Dashboard />} />
          <Route path={routes.chatdashboard} element={<ChatRoomsDashboard />} />
          <Route path={routes.engage} element={<LandingPage />} />
          <Route path={routes.organization} element={<OrganizationListing/>} />
          <Route path={routes.oupdate} element={<OrganizationUpdate />} />
          <Route path={routes.ocreate} element={<OrganizationCreate />} />
          <Route path={routes.orgmember} element={<OrgMain />} />
          <Route path={routes.orgmanage} element={<MemberDashboard />} />
          <Route path={routes.review} element={<Reviews />} />
          <Route path={routes.rdashboard} element={<ReviewsDashboard />} />
          {/* Going to route "localhost:5001/" will go to homepage */}
          <Route path={routes.root} element={<Navigate to={routes.home} />} />

          {/* This should always come last.  
            If the path has no match, show page not found */}
          <Route path="*" element={<NotFoundPage />} />
        </Switch>
      </PageWrapper>
    </>
  );
};
