import styles from "./Entities.module.scss";
import { Tree } from "antd";
import { LabelItem } from "./LabelItem";
import { RegionItem } from "./RegionItem";
import { observer } from "mobx-react";
import { useState } from "react";
import { LsChevron } from "../../assets/icons";
import { FF_DEV_2755, isFF } from "../../utils/feature-flags";

const { localStorage } = window;
const localStoreName = `collapsed-label-pos`;

export const LabelList = observer(({ regionStore }) => {
  const treeData = regionStore.asLabelsTree((item, idx, isLabel, children, onClick) => {
    return {
      key: item.id,
      title: (data) => {
        return isLabel ? (
          <LabelItem item={item} idx={idx} regions={data.children} regionStore={regionStore} />
        ) : (
          <RegionItem item={item} idx={idx} onClick={onClick}/>
        );
      },
    };
  });

  if( isFF(FF_DEV_2755) ) {
    const [collapsedPos, setCollapsedPos] = useState( localStorage.getItem( localStoreName )?.split?.(",")?.filter( pos => !!pos ) ?? [] );
  
    const updateLocalStorage = ( collapsedPos ) => {
      localStorage.setItem( localStoreName, collapsedPos );
    };
  
    const collapse = ( pos ) => {
      const newCollapsedPos = [...collapsedPos, pos];
  
      setCollapsedPos( newCollapsedPos );
      updateLocalStorage( newCollapsedPos );
    };
  
    const expand = ( pos ) => {
      const newCollapsedPos = collapsedPos.filter( cPos => cPos !== pos );
      
      setCollapsedPos( newCollapsedPos );
      updateLocalStorage( newCollapsedPos );
    };
    const expandedKeys = treeData.filter( (item, itemIndex) => !collapsedPos.includes( `0-${itemIndex}` ) ).map( item => item.key ) ?? [];
  
    return (
      <Tree
        className={styles.treelabels}
        treeData={treeData}
        showIcon={false}
        blockNode={true}
        defaultExpandAll={true}
        autoExpandParent={true}
        expandedKeys={expandedKeys}
        switcherIcon={<LsChevron className={styles.switcherIcon} opacity="0.25" />}
        onExpand={( internalExpandedKeys, { node } ) => {
          const nodeRegionIndex = treeData.findIndex(region => region.key === node.key);
          const pos = `0-${nodeRegionIndex}`;
  
          collapsedPos.includes(pos) ? expand(pos) : collapse(pos);
        }}
      />
    );
  }

  return (
    <Tree
      className={styles.treelabels}
      treeData={treeData}
      showIcon={false}
      blockNode={true}
      defaultExpandAll={true}
      autoExpandParent={true}
      switcherIcon={<LsChevron opacity="0.25" />}
    />
  );
});
