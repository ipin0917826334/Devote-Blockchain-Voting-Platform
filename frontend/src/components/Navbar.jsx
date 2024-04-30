import React, { useState, useContext } from 'react';
import { Menu, Button, Drawer, Dropdown } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { MenuOutlined } from '@ant-design/icons';
import { UserContext } from './UserContext';

const Navbar = ({ history, topicId }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    if (history === "join") {
      navigate(`/vote-link/${topicId}`);
    }
    else {
      navigate("/");
    }
  };

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const onCloseDrawer = () => {
    setDrawerVisible(false);
  };
  const menu = (
    <Menu>
      <Menu.Item onClick={logout}>
        Logout
      </Menu.Item>
    </Menu>
  );
  return (
    <nav className="navbar flex bg-[#36ABD1] items-center justify-between bg-blue-500 p-5 inset-x-[0] mx-auto">
      <div className="flex items-center">
        <Link to="/" className="font-[700] pl-10 font-inconsolata h-[45px] inline text-white text-left text-5xl">
          DeVote
        </Link>
        {user && (
          <div className="ml-8 hidden md:flex">
            <Link to="/create" className="font-[400] text-[28px] font-junge text-white hover:text-black-500 ml-10">
              Create
            </Link>
            <Link to="/history" className="font-[400] text-[28px] font-junge text-white hover:text-black-500 ml-10">
              History
            </Link>
            <Link to="/feedback" className="font-[400] text-[28px] font-junge text-white hover:text-black-500 ml-10">
              Feedback
            </Link>
          </div>
        )}
      </div>
      <div className="flex items-center">
        <div className="hidden md:flex">
          {user && user.firstName && user.lastName ? (
            <>
              <div className="flex flex-col items-start">
                <Dropdown overlay={menu}>
                  <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                    <div className="font-[400] text-2xl font-junge text-white ml-10">{`${user.firstName} ${user.lastName}`}</div>
                    <div className="font-[400] text-xl font-junge text-white ml-10">{user.email}</div>
                  </a>
                </Dropdown>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="font-[400] text-[28px] font-junge text-white hover:text-black-500 ml-10">
                Login
              </Link>
              <Link to="/register" className="font-[400] text-[28px] font-junge text-white hover:text-black-500 ml-10">
                Register
              </Link>
            </>
          )}
        </div>
        <Button className="md:hidden ml-4" type="text" icon={<MenuOutlined />} onClick={showDrawer} />
      </div>
      <Drawer
        title="Menu"
        placement="right"
        closable={true}
        onClose={onCloseDrawer}
        visible={drawerVisible}
      >
        <Menu mode="vertical" className="w-full">
          {user && (
            <>
              <Menu.Item key="1">
                <Link to="/create">Create</Link>
              </Menu.Item>
              <Menu.Item key="2">
                <Link to="/history">History</Link>
              </Menu.Item>
              <Menu.Item key="3">
                <Link to="/feedback">Feedback</Link>
              </Menu.Item>
            </>
          )}
          {user && user.firstName && user.lastName ? (
            <>
              <Menu.Item key="4" onClick={logout}>
                Logout
              </Menu.Item>
            </>
          ) : (
            <>
              <Menu.Item key="3">
                <Link to="/login">Login</Link>
              </Menu.Item>
              <Menu.Item key="4">
                <Link to="/register">Register</Link>
              </Menu.Item>
            </>
          )}
        </Menu>
      </Drawer>
    </nav>
  );
};

export default Navbar;
