import { Room } from "@domain/entities/room";
import { Menu } from "antd";
import { ItemType } from "antd/lib/menu/hooks/useItems";
import React from "react";

export type MenuBarProps = {
  rooms?: Room[];
  onRoomClicked: (room: Room) => void;
};

const MenuBar: React.FC<MenuBarProps> = ({ rooms, onRoomClicked }) => {
  const makeRoomItem = (room: Room): ItemType => ({
    key: room.id,
    title: room.name,
    label: room.name,
    onClick: () => onRoomClicked(room),
  });

  const items: ItemType[] = [
    { type: "group", label: "Rooms", children: rooms?.map(makeRoomItem) },
  ];

  return <Menu mode="inline" items={items} />;
};

export default MenuBar;
