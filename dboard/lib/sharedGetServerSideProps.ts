import { GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import DataPageSet from "../lib/domain/dataPageSet";
import DataPage from "../lib/domain/dataPage"

type SharedServerSideProps = {
    session: string | null;
    pageSet: DataPageSet;
    pageSetIndex: string[];
    pageConfig?: DataPage;
}

export const sharedGetServerSideProps = async (
  context: GetServerSidePropsContext
) : Promise<{ props: SharedServerSideProps} | { redirect: { destination: string, permanent: boolean}}> => {
  const cookies = parseCookies(context);
  const sessionToken = cookies.session;

  if (process.env.skip_login !== "true" && !sessionToken) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const { getPageSet, getPageSetIndex } = await import("../lib/pageSets");

  const { pageset } = context.query;
  const pageset_str = Array.isArray(pageset) ? pageset[0] : pageset ?? ((process.env.config_id) ? process.env.config_id.split(";")[0] : "default")
  const proto = context.req.headers["x-forwarded-proto"] as string ?? "http";
  const baseUrl = `${proto}://${context.req.headers.host}${process.env.NEXT_PUBLIC_BASE_PATH || ''}`;
  console.debug({pageset_str:pageset_str, baseUrl: baseUrl})
  const pageSet = await getPageSet(pageset_str, baseUrl)
  const pageSetTindex = await getPageSetIndex(baseUrl)
  return {
    props: {
      session: sessionToken ?? null,
      pageSet: pageSet,
      pageSetIndex: pageSetTindex
    },
  };
};

export const pageGetServerSideProps = async (
    context: GetServerSidePropsContext
    ) => {
    const { page } = context.query;
    const result = await sharedGetServerSideProps(context)

    const page_index_int : number = Array.isArray(page) ? parseInt(page[0]) : (page) ? parseInt(page) : 0
    if("props" in result) {
        if(page_index_int > result.props.pageSet.pages.length - 1) {
            throw new Error("Error: page " + page_index_int + " not found in pageSet " + result.props.pageSet.id);
        }
        const pageConfig = result.props.pageSet.pages[page_index_int]
        result.props.pageConfig = pageConfig
    }
    return result
}