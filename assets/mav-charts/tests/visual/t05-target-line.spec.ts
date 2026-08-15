import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
const systems=["signal","editorial","digital"] as const;
const layouts={wide:{width:1280,height:720},standard:{width:1024,height:768},card:{width:720,height:720},mobile:{width:390,height:844}} as const;

test("T05 keeps actual and target honest in one domain", async ({page},testInfo)=>{
  test.skip(testInfo.project.name!=="desktop","One desktop project owns the matrix");
  const problems:string[]=[]; page.on("console",m=>{if(["error","warning"].includes(m.type()))problems.push(m.text())}); page.on("pageerror",e=>problems.push(e.message));
  for(const [layout,viewport] of Object.entries(layouts)){
    await page.setViewportSize(viewport);
    for(const system of systems){
      await page.goto(`/?template=T05&theme=${system}&capture`); await page.evaluate(()=>document.fonts.ready);
      const chart=page.locator('[data-chart-id="T05"]'); await expect(chart).toBeVisible(); await expect(chart).toHaveAttribute("data-state","ready");
      await expect(chart.getByRole("group",{name:"Target line interactive chart"})).toHaveAttribute("data-target-animation","false");
      await expect(chart.locator('[data-mav-entry="target-line"]')).toHaveCount(0); await expect(chart.locator("[data-target-actual-dot]")).toHaveCount(4);
      await expect(chart.locator("[data-target-latest-actual]")).toContainText("ACTUAL 91"); await expect(chart.locator("[data-target-latest]")).toContainText("TARGET 75");
      const domain=await chart.getByRole("group",{name:"Target line interactive chart"}).evaluate(n=>[Number(n.getAttribute("data-domain-min")),Number(n.getAttribute("data-domain-max"))]); expect(domain[0]).toBeLessThan(62); expect(domain[1]).toBeGreaterThan(91);
      if(layout==="wide")expect((await new AxeBuilder({page}).include('[data-chart-id="T05"]').analyze()).violations).toEqual([]);
      if(system==="signal"){
        const curves=chart.locator(".recharts-line-curve"); await expect(curves.nth(0)).toHaveAttribute("stroke","#ffffff"); await expect(curves.nth(0)).toHaveAttribute("stroke-dasharray","8 7"); await expect(curves.nth(1)).toHaveAttribute("stroke","#ff0000");
      }
      if(layout==="mobile"){
        const subtitle=await chart.getByText("ACTUAL · TARGET · DELTA",{exact:true}).boundingBox(), legend=await chart.locator("[data-target-legend]").boundingBox(), plot=await chart.locator(".recharts-cartesian-grid").boundingBox(); expect((subtitle?.y??0)+(subtitle?.height??0)).toBeLessThanOrEqual((legend?.y??0)+1); expect((legend?.y??0)+(legend?.height??0)).toBeLessThanOrEqual((plot?.y??0)+1);
      }
      await page.mouse.move(0,0); await expect(chart).toHaveScreenshot(`T05-${system}-${layout}.png`,{animations:"disabled"});
    }
  }
  await page.setViewportSize(layouts.wide); await page.emulateMedia({reducedMotion:"no-preference"}); await page.goto("/?template=T05&theme=signal"); await expect(page.locator('[data-mav-entry="target-line"]')).toHaveCount(4);
  await page.locator('[data-target-actual-dot="Q2"]').hover(); await expect(page.getByText("Actual: 71",{exact:true})).toBeVisible(); await expect(page.getByText("Target: 75",{exact:true})).toBeVisible(); await expect(page.getByText("Delta: -4 · below",{exact:true})).toBeVisible();
  const interactive=page.getByRole("group",{name:"Target line interactive chart"}); await interactive.focus(); await interactive.press("End"); await expect(page.getByRole("status")).toContainText("delta +16; above");
  await page.emulateMedia({reducedMotion:"reduce"}); await page.goto("/?template=T05&theme=signal"); await expect(page.locator('[data-mav-entry="target-line"]')).toHaveCount(0);

  for(const edge of ["empty","single","missing","leading-gap","trailing-gap","negative","constant","target-above","target-below","at-target","extreme","long-label","invalid","duplicate","nonfinite","invalid-target"] as const){
    const edgePage=await page.context().newPage(); edgePage.on("console",m=>{if(["error","warning"].includes(m.type()))problems.push(`${edge}:${m.text()}`)}); edgePage.on("pageerror",e=>problems.push(`${edge}:${e.message}`)); await edgePage.setViewportSize(layouts.mobile);
    const theme=edge==="missing"?"signal":edge==="long-label"?"editorial":"digital"; await edgePage.goto(`/?template=T05&theme=${theme}&case=${edge}&capture`); await edgePage.evaluate(()=>document.fonts.ready); await edgePage.mouse.move(0,0);
    const chart=edgePage.locator('[data-chart-id="T05"]'); await expect(chart).toBeVisible();
    if(["invalid","duplicate","nonfinite","invalid-target"].includes(edge))await expect(chart).toHaveAttribute("data-state","invalid"); else if(edge==="empty")await expect(chart).toHaveAttribute("data-state","empty"); else {
      await expect(chart).toHaveAttribute("data-state","ready");
      const title=chart.getByRole("heading",{name:"Performance cleared the target in Q3"});
      const subtitle=chart.getByText("ACTUAL · TARGET · DELTA",{exact:true});
      const legend=chart.locator("[data-target-legend]");
      const footer=chart.locator("footer");
      for(const element of [title,subtitle,legend,footer]){
        await expect(element).toBeVisible();
        const box=await element.boundingBox(); expect(box?.width??0).toBeGreaterThan(120); expect(box?.height??0).toBeGreaterThan(6);
        const style=await element.evaluate(node=>{const computed=getComputedStyle(node);return{color:computed.color,display:computed.display,opacity:Number(computed.opacity),visibility:computed.visibility}});
        expect(style.display).not.toBe("none"); expect(style.visibility).toBe("visible"); expect(style.opacity).toBeGreaterThanOrEqual(.99); expect(style.color).not.toBe("rgba(0, 0, 0, 0)");
      }
      const subtitleBox=await subtitle.boundingBox(),legendBox=await legend.boundingBox(),plotBox=await chart.locator(".recharts-cartesian-grid").boundingBox();
      expect((subtitleBox?.y??0)+(subtitleBox?.height??0)).toBeLessThanOrEqual((legendBox?.y??0)+1); expect((legendBox?.y??0)+(legendBox?.height??0)).toBeLessThanOrEqual((plotBox?.y??0)+1);
      expect((await title.screenshot()).byteLength).toBeGreaterThan(1200); expect((await subtitle.screenshot()).byteLength).toBeGreaterThan(500); expect((await legend.screenshot()).byteLength).toBeGreaterThan(600); expect((await footer.screenshot()).byteLength).toBeGreaterThan(400);
    }
    if(edge==="missing"){await expect(chart.locator("[data-target-actual-dot]")).toHaveCount(3); const paths=chart.locator(".recharts-line-curve"); const actualPath=await paths.nth(1).getAttribute("d"); expect((actualPath?.match(/M/g)??[]).length).toBeGreaterThanOrEqual(2); await expect(chart.getByRole("table")).toContainText("Missing");}
    if(edge==="target-above"){const d=await chart.getByRole("group",{name:"Target line interactive chart"}).evaluate(n=>[Number(n.getAttribute("data-domain-min")),Number(n.getAttribute("data-domain-max"))]); expect(d[1]).toBeGreaterThan(40);}
    if(edge==="target-below"){const d=await chart.getByRole("group",{name:"Target line interactive chart"}).evaluate(n=>[Number(n.getAttribute("data-domain-min")),Number(n.getAttribute("data-domain-max"))]); expect(d[0]).toBeLessThan(10);}
    if(edge==="at-target")await expect(chart.getByRole("table")).toContainText("at"); if(edge==="long-label")await expect(chart.getByRole("table")).toContainText("First enterprise reporting interval");
    expect(await chart.locator(".recharts-tooltip-wrapper").evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).visibility!=="visible"))).toBe(true); await expect(chart).toHaveScreenshot(`T05-${edge}-mobile.png`,{animations:"allow"}); await edgePage.close();
  }
  for(const system of systems){await page.setViewportSize(layouts.wide); await page.goto(`/?template=T05&theme=${system}&capture`); const chart=page.locator('[data-chart-id="T05"]'); await chart.evaluate(node=>{const e=node as HTMLElement;e.style.width="960px";e.style.height="624px";e.style.transform="scale(.25)";e.style.transformOrigin="top left"}); const box=await chart.boundingBox(); expect(box?.width).toBeCloseTo(240,0); expect(box?.height).toBeCloseTo(156,0); await expect(chart).toHaveScreenshot(`T05-${system}-thumbnail-25pct.png`,{animations:"disabled"});}
  expect(problems).toEqual([]);
});
