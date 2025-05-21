import { UserSignUp } from "../pages/user-page/user-singup";

//This is where you will declare all of your routes (the ones that show up in the search bar)
export const routes = {
  root: `/`,
  home: `/home`,
  user: `/user`,
  usersignup: `/signup`,
  login: `/login`,
  events: `/events`, 
  eparticipants: `/eparticipants`,
  organization:`/organization`,
  oupdate: `/orgupdate`,
  ocreate: `/orgcreate`,
  orgmember: `/orgmember`,
  orgmanage: `/memberdashboard/:organizationId`,
  review:`/review`,
  rdashboard: `/rdashboard`,
  engage: `/chatroom`,
  chatroomdetail: `/chatroom/:chatRoomId`,
  chatmessage: `/chatmessage`,
  dashboard: `/dashboard`,
  chatdashboard: `/chatdashboard`,
  chatroom: `/chatroom`
};
