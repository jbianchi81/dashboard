import { GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import DataPageSet from "../lib/domain/dataPageSet";
import DataPage from "../lib/domain/dataPage"

type SharedServerSideProps = {
    session: string | null;
    pageSet: DataPageSet;
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

  const { getPageSet } = await import("../lib/pageSets");

  const { pageset } = context.query;
  const pageset_str = Array.isArray(pageset) ? pageset[0] : pageset ?? "default"
  const proto = context.req.headers["x-forwarded-proto"] as string ?? "http";
  const baseUrl = `${proto}://${context.req.headers.host}`;
  console.debug({pageset_str:pageset_str, baseUrl: baseUrl})
  const pageSet = await getPageSet(pageset_str, baseUrl)
  return {
    props: {
      session: sessionToken ?? null,
      pageSet: pageSet
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