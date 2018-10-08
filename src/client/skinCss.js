import React, { Component } from 'react';

const SkinCss = props => 
  <div className="skinStyle">
    <style dangerouslySetInnerHTML={{__html: 
      ".scene { color: " + props.skin.graphics.color + " } .grid td { border-color: " + props.skin.graphics.color + " } .grid { border-color: " + props.skin.graphics.color + " }" + 
      ".ship { background-color: " + props.skin.graphics.shipColor + "; }" +
      ".hit { background-color: " + props.skin.graphics.shipHitColor + "; }" +
      ".miss { background-color: " + props.skin.graphics.shipMissColor + "; }" 
    }} />
  </div>

export default SkinCss;